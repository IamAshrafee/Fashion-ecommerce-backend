import { Controller, Get, Patch, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { SettingsService } from './settings.service';
import { UpdateSettingsDto } from './dto/update-settings.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../auth/schemas/user.schema';

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
     * Update Store Settings (ADMIN Only)
     *
     * Updates white-label configuration.
     */
    @Patch()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN)
    @ApiBearerAuth()
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
