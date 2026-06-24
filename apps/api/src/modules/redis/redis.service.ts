import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private client: Redis | null = null;
  private memoryCache: Map<string, { value: string; expiry?: number }> = new Map();
  private isMemoryMode = false;

  constructor(private readonly configService: ConfigService) {}

  onModuleInit() {
    if (!process.env.REDIS_HOST && process.env.NODE_ENV === 'production') {
      console.log('No REDIS_HOST provided in production. Falling back to in-memory cache.');
      this.isMemoryMode = true;
      return;
    }

    this.client = new Redis({
      host: this.configService.get('app.redis.host'),
      port: this.configService.get('app.redis.port'),
      password: this.configService.get('app.redis.password') || undefined,
      maxRetriesPerRequest: 3,
      enableOfflineQueue: false, // Prevents hanging requests if Redis is offline
      retryStrategy: (times) => {
        if (times > 3) return null; // stop retrying after 3 times
        return Math.min(times * 50, 2000);
      }
    });

    this.client.on('error', (err) => {
      console.error('Redis connection error:', err.message);
    });
  }

  onModuleDestroy() {
    this.client?.disconnect();
  }

  // --- Refresh Tokens ---

  async storeRefreshToken(token: string, userId: string, ttlSeconds: number): Promise<void> {
    await this.set(`refresh:${token}`, userId, ttlSeconds);
  }

  async getRefreshTokenUserId(token: string): Promise<string | null> {
    return this.get(`refresh:${token}`);
  }

  async revokeRefreshToken(token: string): Promise<void> {
    await this.del(`refresh:${token}`);
  }

  async revokeAllUserRefreshTokens(userId: string): Promise<void> {
    if (this.isMemoryMode) {
      for (const [key, item] of this.memoryCache.entries()) {
        if (key.startsWith('refresh:') && item.value === userId) {
          this.memoryCache.delete(key);
        }
      }
      return;
    }
    const keys = await this.client!.keys(`refresh:*`);
    for (const key of keys) {
      const storedUserId = await this.client!.get(key);
      if (storedUserId === userId) {
        await this.client!.del(key);
      }
    }
  }

  // --- Token Deny List (for logout) ---

  async addToDenyList(token: string, ttlSeconds: number): Promise<void> {
    await this.set(`deny:${token}`, '1', ttlSeconds);
  }

  async isTokenDenied(token: string): Promise<boolean> {
    const result = await this.get(`deny:${token}`);
    return result !== null;
  }

  // --- Password Reset Tokens ---

  async storeResetToken(token: string, userId: string, ttlSeconds: number): Promise<void> {
    await this.set(`reset:${token}`, userId, ttlSeconds);
  }

  async getResetTokenUserId(token: string): Promise<string | null> {
    return this.get(`reset:${token}`);
  }

  async revokeResetToken(token: string): Promise<void> {
    await this.del(`reset:${token}`);
  }

  // --- Email Verification Tokens ---

  async storeVerificationToken(token: string, userId: string, ttlSeconds: number): Promise<void> {
    await this.set(`verify:${token}`, userId, ttlSeconds);
  }

  async getVerificationTokenUserId(token: string): Promise<string | null> {
    return this.get(`verify:${token}`);
  }

  async revokeVerificationToken(token: string): Promise<void> {
    await this.del(`verify:${token}`);
  }

  // --- Rate Limiting ---

  async incrementRateLimit(key: string, windowSeconds: number): Promise<number> {
    if (this.isMemoryMode) {
      const current = this.memoryCache.get(`rate:${key}`);
      if (!current || (current.expiry && current.expiry < Date.now())) {
        this.memoryCache.set(`rate:${key}`, { value: '1', expiry: Date.now() + windowSeconds * 1000 });
        return 1;
      }
      const newCount = parseInt(current.value, 10) + 1;
      current.value = newCount.toString();
      return newCount;
    }
    const current = await this.client!.incr(`rate:${key}`);
    if (current === 1) {
      await this.client!.expire(`rate:${key}`, windowSeconds);
    }
    return current;
  }

  async getRateLimitCount(key: string): Promise<number> {
    const count = await this.get(`rate:${key}`);
    return count ? parseInt(count, 10) : 0;
  }

  // --- Generic Operations ---

  async set(key: string, value: string, ttlSeconds?: number): Promise<void> {
    if (this.isMemoryMode) {
      this.memoryCache.set(key, {
        value,
        expiry: ttlSeconds ? Date.now() + ttlSeconds * 1000 : undefined,
      });
      return;
    }
    if (ttlSeconds) {
      await this.client!.set(key, value, 'EX', ttlSeconds);
    } else {
      await this.client!.set(key, value);
    }
  }

  async get(key: string): Promise<string | null> {
    if (this.isMemoryMode) {
      const item = this.memoryCache.get(key);
      if (!item) return null;
      if (item.expiry && item.expiry < Date.now()) {
        this.memoryCache.delete(key);
        return null;
      }
      return item.value;
    }
    return this.client!.get(key);
  }

  async del(key: string): Promise<void> {
    if (this.isMemoryMode) {
      this.memoryCache.delete(key);
      return;
    }
    await this.client!.del(key);
  }
}