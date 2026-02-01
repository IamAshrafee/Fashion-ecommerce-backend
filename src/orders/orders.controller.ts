import {
    Controller,
    Get,
    Post,
    Patch,
    Delete,
    Body,
    Param,
    UseGuards,
    Request,
} from '@nestjs/common';
import {
    ApiTags,
    ApiOperation,
    ApiResponse,
    ApiBearerAuth,
    ApiParam,
} from '@nestjs/swagger';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../auth/schemas/user.schema';

/**
 * OrdersController
 *
 * REST API for order management.
 */
@Controller('orders')
@ApiTags('Orders')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class OrdersController {
    constructor(private readonly ordersService: OrdersService) { }

    /**
     * Create order from cart
     */
    @Post()
    @ApiOperation({
        summary: 'Create order from cart',
        description:
            'Create order from current cart. Uses ATOMIC TRANSACTION to ensure stock consistency. Implements SNAPSHOT PATTERN to freeze product data.',
    })
    @ApiResponse({
        status: 201,
        description: 'Order created successfully. Cart cleared. Stock decremented.',
    })
    @ApiResponse({ status: 400, description: 'Cart empty or insufficient stock' })
    async createOrder(@Request() req: any, @Body() dto: CreateOrderDto) {
        return await this.ordersService.createOrder(req.user._id, dto);
    }

    /**
     * Get all user orders
     */
    @Get()
    @ApiOperation({
        summary: 'Get all user orders',
        description: 'Retrieve all orders for authenticated user, sorted by date (newest first).',
    })
    @ApiResponse({ status: 200, description: 'Orders retrieved successfully' })
    async findAll(@Request() req: any) {
        return await this.ordersService.findAll(req.user._id);
    }

    /**
     * Get single order
     */
    @Get(':id')
    @ApiOperation({
        summary: 'Get order by ID',
        description: 'Retrieve single order with snapshot data.',
    })
    @ApiParam({ name: 'id', description: 'Order ID' })
    @ApiResponse({ status: 200, description: 'Order found' })
    @ApiResponse({ status: 404, description: 'Order not found' })
    async findById(@Request() req: any, @Param('id') id: string) {
        return await this.ordersService.findById(id, req.user._id);
    }

    /**
     * Update order status (ADMIN only)
     */
    @Patch(':id/status')
    @UseGuards(RolesGuard)
    @Roles(UserRole.ADMIN)
    @ApiOperation({
        summary: 'Update order status',
        description: 'Update order status (ADMIN only). Status flow: PENDING → PAID → SHIPPED → DELIVERED.',
    })
    @ApiParam({ name: 'id', description: 'Order ID' })
    @ApiResponse({ status: 200, description: 'Order status updated' })
    @ApiResponse({ status: 403, description: 'Forbidden - Admin only' })
    @ApiResponse({ status: 404, description: 'Order not found' })
    async updateStatus(@Param('id') id: string, @Body() dto: UpdateOrderStatusDto) {
        return await this.ordersService.updateStatus(id, dto);
    }

    /**
     * Cancel order
     */
    @Delete(':id/cancel')
    @ApiOperation({
        summary: 'Cancel order',
        description:
            'Cancel PENDING order and restore stock. Uses ATOMIC TRANSACTION. Cannot cancel PAID/SHIPPED/DELIVERED orders.',
    })
    @ApiParam({ name: 'id', description: 'Order ID' })
    @ApiResponse({
        status: 200,
        description: 'Order cancelled. Stock restored.',
    })
    @ApiResponse({
        status: 400,
        description: 'Cannot cancel non-PENDING order',
    })
    @ApiResponse({ status: 404, description: 'Order not found' })
    async cancelOrder(@Request() req: any, @Param('id') id: string) {
        return await this.ordersService.cancelOrder(id, req.user._id);
    }
}
