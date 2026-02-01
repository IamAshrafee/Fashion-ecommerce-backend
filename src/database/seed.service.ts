import { Injectable, Logger } from '@nestjs/common';
import { SettingsService } from '../settings/settings.service';

/**
 * SeedService
 *
 * Handles database seeding for initial setup and development.
 * Ensures all required singleton documents exist with default values.
 */
@Injectable()
export class SeedService {
    private readonly logger = new Logger(SeedService.name);

    constructor(private readonly settingsService: SettingsService) { }

    /**
     * Seed All Data
     *
     * Master method that runs all seeding operations.
     * Safe to run multiple times (idempotent).
     */
    async seedAll(): Promise<void> {
        this.logger.log('🌱 Starting database seeding...');

        await this.seedSettings();

        this.logger.log('✅ Database seeding completed successfully!');
    }

    /**
     * Seed Settings
     *
     * Creates default settings document if none exists.
     * Idempotent: Running multiple times won't create duplicates.
     */
    async seedSettings(): Promise<void> {
        this.logger.log('📋 Seeding settings...');
        await this.settingsService.ensureSettingsExist();
    }
}
