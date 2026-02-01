import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

/**
 * UpdateCartItemDto
 *
 * Validation for updating cart item quantity
 */
const UpdateCartItemSchema = z.object({
    /**
     * New quantity
     * @example 3
     */
    quantity: z.number().int().min(1, 'Quantity must be at least 1').describe('New quantity'),
});

export class UpdateCartItemDto extends createZodDto(UpdateCartItemSchema) { }
