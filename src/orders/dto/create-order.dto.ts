import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

/**
 * CreateOrderDto
 *
 * Creates order from user's cart
 */
const CreateOrderSchema = z.object({
    /**
     * Shipping address
     */
    shippingAddress: z.object({
        street: z.string().min(1, 'Street is required'),
        city: z.string().min(1, 'City is required'),
        state: z.string().min(1, 'State is required'),
        zip: z.string().min(1, 'ZIP code is required'),
        country: z.string().min(1, 'Country is required'),
    }),
});

export class CreateOrderDto extends createZodDto(CreateOrderSchema) { }
