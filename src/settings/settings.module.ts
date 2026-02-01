import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { SettingsController } from './settings.controller';
import { SettingsService } from './settings.service';
import { Settings, SettingsSchema } from './schemas/settings.schema';

/**
 * SettingsModule
 *
 * Manages white-label store configuration.
 * Implements singleton pattern for settings storage.
 */
@Module({
    imports: [
        MongooseModule.forFeature([
            { name: Settings.name, schema: SettingsSchema },
        ]),
    ],
    controllers: [SettingsController],
    providers: [SettingsService],
    exports: [SettingsService], // Export for use in seed scripts and other modules
})
export class SettingsModule { }
