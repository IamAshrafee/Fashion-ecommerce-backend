import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

/**
 * Zod Schema for Updating Settings
 *
 * All fields are optional to support partial updates.
 * Validation rules match CreateSettingsSchema.
 */
const UpdateSettingsSchema = z.object({
    storeName: z
        .string()
        .min(1, 'Store name cannot be empty')
        .max(100, 'Store name must not exceed 100 characters')
        .optional()
        .describe('Name of the store displayed to customers'),

    currencySymbol: z
        .string()
        .min(1, 'Currency symbol cannot be empty')
        .max(10, 'Currency symbol must not exceed 10 characters')
        .optional()
        .describe('Currency symbol or code (e.g., BDT, USD, $, €)'),

    shippingCharge: z
        .number()
        .min(0, 'Shipping charge cannot be negative')
        .optional()
        .describe('Flat rate shipping cost'),

    logoUrl: z
        .string()
        .url('Logo URL must be a valid URL')
        .optional()
        .nullable()
        .describe('URL of the store logo'),
});

/**
 * UpdateSettingsDto
 *
 * Data Transfer Object for updating existing settings.
 * All fields are optional to support partial updates via PATCH.
 */
export class UpdateSettingsDto extends createZodDto(UpdateSettingsSchema) { }
