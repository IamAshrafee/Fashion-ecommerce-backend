import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';
import { OrderStatus } from '../schemas/order.schema';

/**
 * UpdateOrderStatusDto
 *
 * For admin to update order status
 */
const UpdateOrderStatusSchema = z.object({
    /**
     * New status
     * @example "PAID"
     */
    status: z.nativeEnum(OrderStatus).describe('New order status'),
});

export class UpdateOrderStatusDto extends createZodDto(UpdateOrderStatusSchema) { }
