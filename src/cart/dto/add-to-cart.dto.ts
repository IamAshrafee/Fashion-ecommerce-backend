import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

/**
 * AddToCartDto
 *
 * Validation for adding items to cart
 */
const AddToCartSchema = z.object({
    /**
     * Product ID
     * @example "507f1f77bcf86cd799439011"
     */
    productId: z
        .string()
        .regex(/^[0-9a-fA-F]{24}$/, 'Invalid MongoDB ObjectId')
        .describe('Product ID'),

    /**
     * Variant SKU
     * @example "NIKE-AM23-RED-42"
     */
    variantSku: z.string().min(1, 'Variant SKU is required').describe('Variant SKU'),

    /**
     * Quantity to add
     * @example 2
     */
    quantity: z.number().int().min(1, 'Quantity must be at least 1').describe('Quantity'),
});

export class AddToCartDto extends createZodDto(AddToCartSchema) { }
