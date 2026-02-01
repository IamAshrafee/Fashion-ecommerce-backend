import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

/**
 * Zod Schema for Creating Settings
 *
 * All fields are required during creation with strict validation rules.
 */
const CreateSettingsSchema = z.object({
    storeName: z
        .string()
        .min(1, 'Store name is required')
        .max(100, 'Store name must not exceed 100 characters')
        .describe('Name of the store displayed to customers'),

    currencySymbol: z
        .string()
        .min(1, 'Currency symbol is required')
        .max(10, 'Currency symbol must not exceed 10 characters')
        .describe('Currency symbol or code (e.g., BDT, USD, $, €)'),

    shippingCharge: z
        .number()
        .min(0, 'Shipping charge cannot be negative')
        .describe('Flat rate shipping cost'),

    logoUrl: z
        .string()
        .url('Logo URL must be a valid URL')
        .optional()
        .nullable()
        .describe('URL of the store logo'),
});

/**
 * CreateSettingsDto
 *
 * Data Transfer Object for creating new settings.
 * Generated from Zod schema for automatic validation and Swagger integration.
 */
export class CreateSettingsDto extends createZodDto(CreateSettingsSchema) { }
