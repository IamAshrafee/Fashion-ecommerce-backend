import { Controller, Get, Patch, Body } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { SettingsService } from './settings.service';
import { UpdateSettingsDto } from './dto/update-settings.dto';

/**
 * SettingsController
 *
 * Manages store white-label configuration endpoints.
 * GET endpoint is public (needed for frontend display).
 * PATCH endpoint will be admin-only in Phase 3 (Auth module).
 */
@Controller('settings')
@ApiTags('Settings')
export class SettingsController {
    constructor(private readonly settingsService: SettingsService) { }

    /**
     * Get Store Settings
     *
     * Public endpoint that returns white-label configuration.
     * Frontend uses this to display store name, currency, shipping info.
     */
    @Get()
    @ApiOperation({
        summary: 'Get store settings',
        description:
            'Retrieves white-label configuration including store name, currency, and shipping charge. Public endpoint for frontend display.',
    })
    @ApiResponse({
        status: 200,
        description: 'Settings retrieved successfully',
    })
    async getSettings() {
        return await this.settingsService.getSettings();
    }

    /**
     * Update Store Settings
     *
     * Updates white-label configuration.
     * TODO: Add @Roles('ADMIN') guard in Phase 3
     */
    @Patch()
    @ApiOperation({
        summary: 'Update store settings',
        description:
            'Updates white-label configuration. Currently public, will be restricted to admin role in Phase 3.',
    })
    @ApiResponse({
        status: 200,
        description: 'Settings updated successfully',
    })
    @ApiResponse({
        status: 400,
        description: 'Validation error - invalid update data',
    })
    async updateSettings(@Body() updateDto: UpdateSettingsDto) {
        return await this.settingsService.updateSettings(updateDto);
    }
}
