import { BullModule } from '@nestjs/bull';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { MongooseModule } from '@nestjs/mongoose';
import { PassportModule } from '@nestjs/passport';
import { ScheduleModule } from '@nestjs/schedule';
import { AddressModule } from './address/address.module';
import { ApiKeyModule } from './api-key/api-key.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { CategoryModule } from './category/category.module';
import { GeminiModule } from './gemini/gemini.module';
import { HealthModule } from './health/health.module';
import { PostModule } from './post/post.module';
import { RedisModule } from './redis/redis.module';
import { TasksModule } from './taskSchedule/tasks.module';
import { UploadModule } from './upload/upload.module';
import { UsersModule } from './user/user.module';
import { WishlistModule } from './wishlist/wishlist.module';


@Module({
  imports: [
    ScheduleModule.forRoot(),
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get<string>('MONGODB_URI'), // Lấy URI MongoDB từ file .env
      }),
      inject: [ConfigService],
    }),
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: {
          expiresIn: configService.get<string>('JWT_EXPIRES_IN', '1d'),
        },
      }),
    }),
    BullModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        redis: {
          host: configService.get<string>('REDIS_HOST'),
          port: configService.get<number>('REDIS_PORT'),
          password: configService.get<string>('REDIS_PASSWORD'),
        }, defaultJobOptions: {
          attempts: 3,
          backoff: {
            type: 'exponential',
            delay: 5000,
          },
          removeOnComplete: true,
          removeOnFail: true,
        },
      }),
      inject: [ConfigService],
    }),
    TasksModule,
    RedisModule,
    GeminiModule,
    AuthModule,
    UsersModule,
    ApiKeyModule,
    CategoryModule,
    // CartModule,
    // ReviewModule,
    WishlistModule,
    // NotificationModule,
    // SettingModule,
    HealthModule,
    UploadModule,
    // PaymentModule,
    AddressModule,
    PostModule,
    // ChatModule
  ],
  providers: [AppService],
  controllers: [AppController]
})
export class AppModule { }
