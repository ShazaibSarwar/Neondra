import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { getModelToken } from '@nestjs/sequelize';
import { ConflictException, UnauthorizedException, BadRequestException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { AuthService } from '../auth.service';
import { RedisService } from '../../redis/redis.service';
import { EmailService } from '../../email/email.service';
import { User } from '../../../database/models';

describe('AuthService', () => {
  let service: AuthService;
  let userRepository: any;
  let redisService: any;
  let emailService: any;
  let jwtService: any;

  beforeEach(async () => {
    userRepository = {
      findOne: jest.fn(),
      create: jest.fn((dto) => ({ id: 'user-1', ...dto })),
      save: jest.fn((user) => Promise.resolve(user)),
    };

    redisService = {
      storeVerificationToken: jest.fn(),
      getVerificationTokenUserId: jest.fn(),
      revokeVerificationToken: jest.fn(),
      storeRefreshToken: jest.fn(),
      getRefreshTokenUserId: jest.fn(),
      revokeRefreshToken: jest.fn(),
      revokeAllUserRefreshTokens: jest.fn(),
      storeResetToken: jest.fn(),
      getResetTokenUserId: jest.fn(),
      revokeResetToken: jest.fn(),
      addToDenyList: jest.fn(),
      isTokenDenied: jest.fn().mockResolvedValue(false),
    };

    emailService = {
      sendVerificationEmail: jest.fn(),
      sendPasswordResetEmail: jest.fn(),
    };

    jwtService = {
      sign: jest.fn().mockReturnValue('mock-jwt-token'),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: getModelToken(User), useValue: userRepository },
        { provide: RedisService, useValue: redisService },
        { provide: EmailService, useValue: emailService },
        { provide: JwtService, useValue: jwtService },
        { provide: ConfigService, useValue: { get: jest.fn() } },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  describe('register', () => {
    it('should register a new user successfully', async () => {
      userRepository.findOne.mockResolvedValue(null);

      const result = await service.register({
        name: 'Test User',
        email: 'test@example.com',
        password: 'Password1',
      });

      expect(result.message).toContain('Registration successful');
      expect(userRepository.save).toHaveBeenCalled();
      expect(redisService.storeVerificationToken).toHaveBeenCalled();
      expect(emailService.sendVerificationEmail).toHaveBeenCalledWith(
        'test@example.com',
        'Test User',
        expect.any(String),
      );
    });

    it('should throw ConflictException for duplicate email', async () => {
      userRepository.findOne.mockResolvedValue({ id: 'existing', email: 'test@example.com' });

      await expect(
        service.register({ name: 'Test', email: 'test@example.com', password: 'Password1' }),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('login', () => {
    it('should return tokens for valid credentials', async () => {
      const hashedPassword = await bcrypt.hash('Password1', 12);
      userRepository.findOne.mockResolvedValue({
        id: 'user-1',
        name: 'Test',
        email: 'test@example.com',
        password_hash: hashedPassword,
        is_verified: true,
        is_active: true,
        failed_login_attempts: 0,
        locked_until: null,
      });

      const result = await service.login({ email: 'test@example.com', password: 'Password1' });

      expect(result.access_token).toBe('mock-jwt-token');
      expect(result.refresh_token).toBeDefined();
      expect(result.user.email).toBe('test@example.com');
    });

    it('should throw for invalid credentials', async () => {
      userRepository.findOne.mockResolvedValue(null);

      await expect(
        service.login({ email: 'wrong@example.com', password: 'wrong' }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should lock account after 5 failed attempts', async () => {
      const hashedPassword = await bcrypt.hash('Password1', 12);
      const user = {
        id: 'user-1',
        password_hash: hashedPassword,
        is_verified: true,
        is_active: true,
        failed_login_attempts: 4,
        locked_until: null,
      };
      userRepository.findOne.mockResolvedValue(user);

      await expect(
        service.login({ email: 'test@example.com', password: 'WrongPassword1' }),
      ).rejects.toThrow(UnauthorizedException);

      expect(user.locked_until).not.toBeNull();
    });

    it('should reject unverified user', async () => {
      const hashedPassword = await bcrypt.hash('Password1', 12);
      userRepository.findOne.mockResolvedValue({
        id: 'user-1',
        password_hash: hashedPassword,
        is_verified: false,
        is_active: true,
        failed_login_attempts: 0,
        locked_until: null,
      });

      await expect(
        service.login({ email: 'test@example.com', password: 'Password1' }),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('verifyEmail', () => {
    it('should verify email with valid token', async () => {
      redisService.getVerificationTokenUserId.mockResolvedValue('user-1');
      userRepository.findOne.mockResolvedValue({ id: 'user-1', is_verified: false });

      const result = await service.verifyEmail('valid-token');

      expect(result.message).toContain('verified');
      expect(redisService.revokeVerificationToken).toHaveBeenCalledWith('valid-token');
    });

    it('should throw for invalid token', async () => {
      redisService.getVerificationTokenUserId.mockResolvedValue(null);

      await expect(service.verifyEmail('invalid')).rejects.toThrow(BadRequestException);
    });
  });

  describe('refreshToken', () => {
    it('should rotate tokens on refresh', async () => {
      redisService.getRefreshTokenUserId.mockResolvedValue('user-1');
      userRepository.findOne.mockResolvedValue({ id: 'user-1', is_active: true, email: 'test@example.com' });

      const result = await service.refreshToken('old-refresh-token');

      expect(redisService.revokeRefreshToken).toHaveBeenCalledWith('old-refresh-token');
      expect(result.access_token).toBeDefined();
      expect(result.refresh_token).toBeDefined();
    });

    it('should reject invalid refresh token', async () => {
      redisService.getRefreshTokenUserId.mockResolvedValue(null);

      await expect(service.refreshToken('invalid')).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('logout', () => {
    it('should revoke tokens and add to deny list', async () => {
      await service.logout('refresh-token', 'access-token');

      expect(redisService.revokeRefreshToken).toHaveBeenCalledWith('refresh-token');
      expect(redisService.addToDenyList).toHaveBeenCalledWith('access-token', 900);
    });
  });
});
