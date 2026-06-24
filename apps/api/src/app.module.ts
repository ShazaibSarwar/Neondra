import { Module, OnModuleInit } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { SequelizeModule } from '@nestjs/sequelize';
import { ThrottlerModule } from '@nestjs/throttler';
import { AuthModule } from './modules/auth/auth.module';
import { UserModule } from './modules/user/user.module';
import { FamilyModule } from './modules/family/family.module';
import { PersonModule } from './modules/person/person.module';
import { WeddingModule } from './modules/wedding/wedding.module';
import { TransactionModule } from './modules/transaction/transaction.module';
import { ReportModule } from './modules/report/report.module';
import { BalanceModule } from './modules/balance/balance.module';
import { RedisModule } from './modules/redis/redis.module';
import { EmailModule } from './modules/email/email.module';
import { RelationModule } from './modules/relation/relation.module';
import { RelationService } from './modules/relation/relation.service';
import { EventTypeModule } from './modules/event-type/event-type.module';
import { EventTypeService } from './modules/event-type/event-type.service';
import databaseConfig from './config/database.config';
import appConfig from './config/app.config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [databaseConfig, appConfig],
    }),
    SequelizeModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        dialect: 'postgres',
        host: configService.get('database.host'),
        port: configService.get('database.port'),
        username: configService.get('database.username'),
        password: configService.get('database.password'),
        database: configService.get('database.name'),
        autoLoadModels: true,
        synchronize: configService.get('database.synchronize'),
        logging: configService.get('database.logging'),
      }),
    }),
    ThrottlerModule.forRoot([
      {
        name: 'short',
        ttl: 60000,
        limit: 20,
      },
      {
        name: 'medium',
        ttl: 60000,
        limit: 100,
      },
    ]),
    RedisModule,
    EmailModule,
    AuthModule,
    UserModule,
    FamilyModule,
    PersonModule,
    WeddingModule,
    TransactionModule,
    BalanceModule,
    ReportModule,
    RelationModule,
    EventTypeModule,
  ],
})
export class AppModule implements OnModuleInit {
  constructor(
    private readonly relationService: RelationService,
    private readonly eventTypeService: EventTypeService,
  ) {}

  async onModuleInit() {
    await this.relationService.seed();
    await this.eventTypeService.seed();
    console.log('Relations and Event Types seeded successfully');
  }
}

