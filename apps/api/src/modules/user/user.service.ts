import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import * as bcrypt from 'bcrypt';
import { User } from '../../database/models';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { ChangePasswordDto } from './dto/change-password.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User)
    private readonly userRepository: typeof User,
  ) {}

  async getProfile(userId: string) {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');
    
    const { password_hash, failed_login_attempts, locked_until, ...profile } = user.get({ plain: true });
    return profile;
  }

  async updateProfile(userId: string, dto: UpdateProfileDto) {
    await this.userRepository.update(dto, { where: { id: userId } });
    return this.getProfile(userId);
  }

  async changePassword(userId: string, dto: ChangePasswordDto) {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    const isValid = await bcrypt.compare(dto.current_password, user.password_hash);
    if (!isValid) {
      throw new BadRequestException('Current password is incorrect');
    }

    const password_hash = await bcrypt.hash(dto.new_password, 12);
    await this.userRepository.update({ password_hash }, { where: { id: userId } });
    return { message: 'Password changed successfully' };
  }

  async uploadAvatar(userId: string, file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    const allowedTypes = ['image/jpeg', 'image/png'];
    if (!allowedTypes.includes(file.mimetype)) {
      throw new BadRequestException('Only JPEG and PNG files are allowed');
    }

    if (file.size > 2 * 1024 * 1024) {
      throw new BadRequestException('File size must not exceed 2MB');
    }

    // TODO: Upload to S3 and get URL
    const avatar_url = `/uploads/avatars/${file.filename}`;
    await this.userRepository.update({ avatar_url }, { where: { id: userId } });
    return { avatar_url };
  }
}
