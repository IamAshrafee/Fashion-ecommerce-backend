import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Settings, SettingsDocument } from './schemas/settings.schema';
import { UpdateSettingsDto } from './dto/update-settings.dto';
import { ConfigService } from '@nestjs/config';

/**
 * SettingsService
 *
 * Manages white-label configuration using the Singleton pattern.
 * Only ONE settings document should exist in the database.
 */
@Injectable()
export class SettingsService {
    private readonly logger = new Logger(SettingsService.name);

    constructor(
        @InjectModel(Settings.name) private settingsModel: Model<SettingsDocument>,
        private configService: ConfigService,
    ) { }

    /**
     * Get Settings (Singleton)
     *
     * Retrieves the settings document. If none exists, creates default settings.
     * This ensures the settings singleton always exists.
     *
     * @returns Settings document
     */
    async getSettings() {
        let settings = await this.settingsModel.findOne().exec();

        if (!settings) {
            this.logger.warn('⚠️  Settings not found. Creating default settings.');
            settings = await this.createDefaultSettings();
        }

        return settings;
    }

    /**
     * Update Settings
     *
     * Updates the singleton settings document with provided values.
     * If no settings exist, creates them first.
     *
     * @param updateDto - Partial settings update
     * @returns Updated settings document
     */
    async updateSettings(updateDto: UpdateSettingsDto) {
        let settings = await this.settingsModel.findOne().exec();

        if (!settings) {
            this.logger.warn(
                '⚠️  Settings not found during update. Creating with provided values.',
            );
            settings = await this.settingsModel.create(updateDto);
        } else {
            // Update existing settings
            Object.assign(settings, updateDto);
            await settings.save();
        }

        this.logger.log('✅ Settings updated successfully');
        return settings;
    }

    /**
     * Ensure Settings Exist
     *
     * Internal method used by seed scripts to guarantee settings exist.
     * Creates default settings if none are found.
     */
    async ensureSettingsExist(): Promise<void> {
        const exists = await this.settingsModel.findOne().exec();

        if (!exists) {
            await this.createDefaultSettings();
            this.logger.log('✅ Default settings created');
        } else {
            this.logger.log('ℹ️  Settings already exist. Skipping creation.');
        }
    }

    /**
     * Create Default Settings
     *
     * Private helper to create settings with defaults from .env fallback.
     * Used during bootstrapping and seeding.
     */
    private async createDefaultSettings() {
        const defaultSettings = {
            storeName: this.configService.get<string>('STORE_NAME', 'Fashion Store'),
            currencySymbol: this.configService.get<string>('STORE_CURRENCY', 'BDT'),
            shippingCharge: this.configService.get<number>('STORE_SHIPPING_CHARGE', 60),
            logoUrl: null,
        };

        return await this.settingsModel.create(defaultSettings);
    }
}
