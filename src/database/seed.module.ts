import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { SeedService } from './seed.service';
import { SettingsModule } from '../settings/settings.module';
import { CategoriesModule } from '../categories/categories.module';
import { ProductsModule } from '../products/products.module';
import { AuthModule } from '../auth/auth.module';

/**
 * SeedModule
 *
 * Module for database seeding operations.
 * Imports feature modules and database connection for seeding.
 */
@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
            envFilePath: '.env',
        }),
        MongooseModule.forRootAsync({
            inject: [ConfigService],
            useFactory: (configService: ConfigService) => ({
                uri: configService.get<string>('MONGO_URI'),
            }),
        }),
        SettingsModule,
        CategoriesModule,
        ProductsModule,
        AuthModule, // For creating seed users
    ],
    providers: [SeedService],
    exports: [SeedService],
})
export class SeedModule { }
