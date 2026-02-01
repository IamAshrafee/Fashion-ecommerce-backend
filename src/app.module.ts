import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { SettingsModule } from './settings/settings.module';
import { StorageModule } from './storage/storage.module';
import { SeedService } from './database/seed.service';

@Module({
  imports: [
    // ============================================
    // CONFIGURATION MODULE
    // Loads .env file and makes env vars available
    // ============================================
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),

    // ============================================
    // DATABASE: MONGODB via MONGOOSE
    // ============================================
    MongooseModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        uri: configService.get<string>('MONGO_URI'),
      }),
    }),

    // ============================================
    // SECURITY: RATE LIMITING (Throttler)
    // Prevents abuse by limiting requests per IP
    // ============================================
    ThrottlerModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        throttlers: [
          {
            ttl: configService.get<number>('THROTTLE_TTL', 60) * 1000, // Convert to milliseconds
            limit: configService.get<number>('THROTTLE_LIMIT', 10),
          },
        ],
      }),
    }),

    // ============================================
    // FEATURE MODULES
    // ============================================
    SettingsModule,
    StorageModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    SeedService,
    // Apply throttler guard globally
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule { }
