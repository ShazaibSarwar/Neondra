import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private client: Redis;

  constructor(private readonly configService: ConfigService) {}

  onModuleInit() {
    this.client = new Redis({
      host: this.configService.get('app.redis.host'),
      port: this.configService.get('app.redis.port'),
      password: this.configService.get('app.redis.password') || undefined,
      maxRetriesPerRequest: 3,
    });
  }

  onModuleDestroy() {
    this.client?.disconnect();
  }

  // --- Refresh Tokens ---

  async storeRefreshToken(token: string, userId: string, ttlSeconds: number): Promise<void> {
    await this.client.set(`refresh:${token}`, userId, 'EX', ttlSeconds);
  }

  async getRefreshTokenUserId(token: string): Promise<string | null> {
    return this.client.get(`refresh:${token}`);
  }

  async revokeRefreshToken(token: string): Promise<void> {
    await this.client.del(`refresh:${token}`);
  }

  async revokeAllUserRefreshTokens(userId: string): Promise<void> {
    const keys = await this.client.keys(`refresh:*`);
    for (const key of keys) {
      const storedUserId = await this.client.get(key);
      if (storedUserId === userId) {
        await this.client.del(key);
      }
    }
  }

  // --- Token Deny List (for logout) ---

  async addToDenyList(token: string, ttlSeconds: number): Promise<void> {
    await this.client.set(`deny:${token}`, '1', 'EX', ttlSeconds);
  }

  async isTokenDenied(token: string): Promise<boolean> {
    const result = await this.client.get(`deny:${token}`);
    return result !== null;
  }

  // --- Password Reset Tokens ---

  async storeResetToken(token: string, userId: string, ttlSeconds: number): Promise<void> {
    await this.client.set(`reset:${token}`, userId, 'EX', ttlSeconds);
  }

  async getResetTokenUserId(token: string): Promise<string | null> {
    return this.client.get(`reset:${token}`);
  }

  async revokeResetToken(token: string): Promise<void> {
    await this.client.del(`reset:${token}`);
  }

  // --- Email Verification Tokens ---

  async storeVerificationToken(token: string, userId: string, ttlSeconds: number): Promise<void> {
    await this.client.set(`verify:${token}`, userId, 'EX', ttlSeconds);
  }

  async getVerificationTokenUserId(token: string): Promise<string | null> {
    return this.client.get(`verify:${token}`);
  }

  async revokeVerificationToken(token: string): Promise<void> {
    await this.client.del(`verify:${token}`);
  }

  // --- Rate Limiting ---

  async incrementRateLimit(key: string, windowSeconds: number): Promise<number> {
    const current = await this.client.incr(`rate:${key}`);
    if (current === 1) {
      await this.client.expire(`rate:${key}`, windowSeconds);
    }
    return current;
  }

  async getRateLimitCount(key: string): Promise<number> {
    const count = await this.client.get(`rate:${key}`);
    return count ? parseInt(count, 10) : 0;
  }

  // --- Generic Operations ---

  async set(key: string, value: string, ttlSeconds?: number): Promise<void> {
    if (ttlSeconds) {
      await this.client.set(key, value, 'EX', ttlSeconds);
    } else {
      await this.client.set(key, value);
    }
  }

  async get(key: string): Promise<string | null> {
    return this.client.get(key);
  }

  async del(key: string): Promise<void> {
    await this.client.del(key);
  }
}