import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/sequelize';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import { User } from '../../database/models';
import { RedisService } from '../redis/redis.service';
import { EmailService } from '../email/email.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

const REFRESH_TOKEN_TTL = 7 * 24 * 60 * 60; // 7 days in seconds
const RESET_TOKEN_TTL = 60 * 60; // 60 minutes
const VERIFICATION_TOKEN_TTL = 24 * 60 * 60; // 24 hours
const LOCKOUT_DURATION = 15 * 60 * 1000; // 15 minutes in ms
const MAX_LOGIN_ATTEMPTS = 5;

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    @InjectModel(User)
    private readonly userRepository: typeof User,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly redisService: RedisService,
    private readonly emailService: EmailService,
  ) {}

  async register(dto: RegisterDto) {
    const existing = await this.userRepository.findOne({ where: { email: dto.email.toLowerCase() } });
    if (existing) {
      throw new ConflictException('Email already registered');
    }

    const password_hash = await bcrypt.hash(dto.password, 12);
    const user = await this.userRepository.create({
      name: dto.name,
      email: dto.email.toLowerCase(),
      password_hash,
    });

    const verificationToken = uuidv4();
    await this.redisService.storeVerificationToken(verificationToken, user.id, VERIFICATION_TOKEN_TTL);

    await this.emailService.sendVerificationEmail(user.email, user.name, verificationToken);

    return {
      message: 'Registration successful. Please check your email to verify your account.',
      userId: user.id,
    };
  }

  async login(dto: LoginDto) {
    const user = await this.userRepository.findOne({ where: { email: dto.email.toLowerCase() } });
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (user.locked_until && new Date() < new Date(user.locked_until)) {
      const remainingMinutes = Math.ceil(
        (new Date(user.locked_until).getTime() - Date.now()) / 60000,
      );
      throw new UnauthorizedException(
        `Account is temporarily locked. Try again in ${remainingMinutes} minutes.`,
      );
    }

    const isPasswordValid = await bcrypt.compare(dto.password, user.password_hash);
    if (!isPasswordValid) {
      user.failed_login_attempts += 1;

      if (user.failed_login_attempts >= MAX_LOGIN_ATTEMPTS) {
        user.locked_until = new Date(Date.now() + LOCKOUT_DURATION);
        user.failed_login_attempts = 0;
        await user.save();
        throw new UnauthorizedException(
          'Account locked due to too many failed attempts. Try again in 15 minutes.',
        );
      }

      await user.save();
      throw new UnauthorizedException('Invalid credentials');
    }

    if (!user.is_verified) {
      throw new UnauthorizedException('Please verify your email before logging in');
    }

    if (!user.is_active) {
      throw new UnauthorizedException('Account has been deactivated');
    }

    user.failed_login_attempts = 0;
    user.locked_until = null as any;
    await user.save();

    const tokens = await this.generateTokens(user);
    return {
      access_token: tokens.accessToken,
      refresh_token: tokens.refreshToken,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        avatar_url: user.avatar_url,
      },
    };
  }

  async refreshToken(refreshToken: string) {
    const userId = await this.redisService.getRefreshTokenUserId(refreshToken);
    if (!userId) {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }

    // Token rotation: revoke old token immediately
    await this.redisService.revokeRefreshToken(refreshToken);

    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user || !user.is_active) {
      throw new UnauthorizedException('User not found or inactive');
    }

    const tokens = await this.generateTokens(user);
    return {
      access_token: tokens.accessToken,
      refresh_token: tokens.refreshToken,
    };
  }

  async logout(refreshToken: string, accessToken?: string) {
    await this.redisService.revokeRefreshToken(refreshToken);

    if (accessToken) {
      // Add access token to deny list for its remaining TTL (max 15 min)
      await this.redisService.addToDenyList(accessToken, 900);
    }

    return { message: 'Logged out successfully' };
  }

  async forgotPassword(email: string) {
    const user = await this.userRepository.findOne({ where: { email: email.toLowerCase() } });

    // Always return same response to prevent email enumeration
    if (!user) {
      return { message: 'If the email exists, a reset link has been sent.' };
    }

    const resetToken = uuidv4();
    await this.redisService.storeResetToken(resetToken, user.id, RESET_TOKEN_TTL);

    await this.emailService.sendPasswordResetEmail(user.email, user.name, resetToken);

    return { message: 'If the email exists, a reset link has been sent.' };
  }

  async resetPassword(token: string, newPassword: string) {
    const userId = await this.redisService.getResetTokenUserId(token);
    if (!userId) {
      throw new BadRequestException('Invalid or expired reset token');
    }

    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new BadRequestException('User not found');
    }

    user.password_hash = await bcrypt.hash(newPassword, 12);
    await user.save();

    // Revoke the reset token so it can't be reused
    await this.redisService.revokeResetToken(token);

    // Revoke all existing refresh tokens for security
    await this.redisService.revokeAllUserRefreshTokens(user.id);

    return { message: 'Password reset successful. Please log in with your new password.' };
  }

  async verifyEmail(token: string) {
    const userId = await this.redisService.getVerificationTokenUserId(token);
    if (!userId) {
      throw new BadRequestException('Invalid or expired verification token');
    }

    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new BadRequestException('User not found');
    }

    if (user.is_verified) {
      await this.redisService.revokeVerificationToken(token);
      return { message: 'Email already verified' };
    }

    user.is_verified = true;
    await user.save();
    await this.redisService.revokeVerificationToken(token);

    return { message: 'Email verified successfully. You can now log in.' };
  }

  async resendVerificationEmail(email: string) {
    const user = await this.userRepository.findOne({ where: { email: email.toLowerCase() } });
    if (!user) {
      return { message: 'If the email exists, a verification link has been sent.' };
    }

    if (user.is_verified) {
      throw new BadRequestException('Email is already verified');
    }

    const verificationToken = uuidv4();
    await this.redisService.storeVerificationToken(verificationToken, user.id, VERIFICATION_TOKEN_TTL);
    await this.emailService.sendVerificationEmail(user.email, user.name, verificationToken);

    return { message: 'If the email exists, a verification link has been sent.' };
  }

  async validateUser(userId: string): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user || !user.is_active) {
      throw new UnauthorizedException('User not found or inactive');
    }
    return user;
  }

  async isTokenDenied(token: string): Promise<boolean> {
    return this.redisService.isTokenDenied(token);
  }

  private async generateTokens(user: User) {
    const payload = { sub: user.id, email: user.email };
    const accessToken = this.jwtService.sign(payload);
    const refreshToken = uuidv4();

    await this.redisService.storeRefreshToken(refreshToken, user.id, REFRESH_TOKEN_TTL);

    return { accessToken, refreshToken };
  }
}
