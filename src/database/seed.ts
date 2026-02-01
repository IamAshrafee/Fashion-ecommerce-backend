/**
 * Database Seed Script
 *
 * Standalone script to populate the database with initial data.
 * Run with: npm run seed
 *
 * Safe to run multiple times - all seed operations are idempotent.
 */

import { NestFactory } from '@nestjs/core';
import { Logger } from '@nestjs/common';
import { SeedModule } from './seed.module';
import { SeedService } from './seed.service';

async function bootstrap() {
    const logger = new Logger('DatabaseSeed');

    try {
        // Create NestJS application context with SeedModule
        logger.log('🚀 Initializing NestJS application...');
        const app = await NestFactory.createApplicationContext(SeedModule);

        // Get seed service
        const seedService = app.get(SeedService);

        // Run all seed operations
        await seedService.seedAll();

        // Close application
        await app.close();
        logger.log('👋 Application closed successfully');

        process.exit(0);
    } catch (error) {
        logger.error('❌ Seeding failed:', error);
        process.exit(1);
    }
}

bootstrap();
