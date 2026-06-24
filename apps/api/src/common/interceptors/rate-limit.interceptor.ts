import { Injectable, NestInterceptor, ExecutionContext, CallHandler, HttpException, HttpStatus } from '@nestjs/common';
import { Observable } from 'rxjs';
import { RedisService } from '../../modules/redis/redis.service';

@Injectable()
export class AuthRateLimitInterceptor implements NestInterceptor {
  constructor(private readonly redisService: RedisService) {}

  async intercept(context: ExecutionContext, next: CallHandler): Promise<Observable<any>> {
    const request = context.switchToHttp().getRequest();
    const ip = request.ip || request.connection.remoteAddress;
    const key = `auth:${ip}`;

    const count = await this.redisService.incrementRateLimit(key, 60);

    if (count > 20) {
      throw new HttpException('Too many requests. Try again later.', HttpStatus.TOO_MANY_REQUESTS);
    }

    return next.handle();
  }
}

@Injectable()
export class ApiRateLimitInterceptor implements NestInterceptor {
  constructor(private readonly redisService: RedisService) {}

  async intercept(context: ExecutionContext, next: CallHandler): Promise<Observable<any>> {
    const request = context.switchToHttp().getRequest();
    const userId = request.user?.id;

    if (!userId) {
      return next.handle();
    }

    const key = `api:${userId}`;
    const count = await this.redisService.incrementRateLimit(key, 60);

    if (count > 100) {
      throw new HttpException('Rate limit exceeded. Max 100 requests per minute.', HttpStatus.TOO_MANY_REQUESTS);
    }

    return next.handle();
  }
}