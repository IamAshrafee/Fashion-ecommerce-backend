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
import { CartService } from './cart.service';
import { AddToCartDto } from './dto/add-to-cart.dto';
import { UpdateCartItemDto } from './dto/update-cart-item.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

/**
 * CartController
 *
 * REST API for cart management (authenticated users only).
 */
@Controller('cart')
@ApiTags('Cart')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class CartController {
    constructor(private readonly cartService: CartService) { }

    /**
     * Get user's cart
     */
    @Get()
    @ApiOperation({
        summary: 'Get current user cart',
        description: 'Retrieve authenticated user cart with computed totals.',
    })
    @ApiResponse({ status: 200, description: 'Cart retrieved successfully' })
    async getCart(@Request() req: any) {
        return await this.cartService.getCart(req.user._id);
    }

    /**
     * Add item to cart
     */
    @Post('add')
    @ApiOperation({
        summary: 'Add item to cart',
        description:
            'Add product variant to cart. CRITICAL: Validates stock availability before adding.',
    })
    @ApiResponse({ status: 200, description: 'Item added to cart' })
    @ApiResponse({
        status: 400,
        description: 'Insufficient stock or invalid product/variant',
    })
    async addToCart(@Request() req: any, @Body() dto: AddToCartDto) {
        return await this.cartService.addToCart(req.user._id, dto);
    }

    /**
     * Update cart item quantity
     */
    @Patch(':itemId')
    @ApiOperation({
        summary: 'Update cart item quantity',
        description: 'Update quantity of existing cart item. Validates stock availability.',
    })
    @ApiParam({ name: 'itemId', description: 'Cart item ID' })
    @ApiResponse({ status: 200, description: 'Cart item updated' })
    @ApiResponse({ status: 400, description: 'Insufficient stock' })
    @ApiResponse({ status: 404, description: 'Cart item not found' })
    async updateCartItem(
        @Request() req: any,
        @Param('itemId') itemId: string,
        @Body() dto: UpdateCartItemDto,
    ) {
        return await this.cartService.updateCartItem(req.user._id, itemId, dto);
    }

    /**
     * Remove cart item
     */
    @Delete(':itemId')
    @ApiOperation({
        summary: 'Remove cart item',
        description: 'Remove specific item from cart.',
    })
    @ApiParam({ name: 'itemId', description: 'Cart item ID' })
    @ApiResponse({ status: 200, description: 'Item removed from cart' })
    @ApiResponse({ status: 404, description: 'Cart item not found' })
    async removeCartItem(@Request() req: any, @Param('itemId') itemId: string) {
        return await this.cartService.removeCartItem(req.user._id, itemId);
    }

    /**
     * Clear entire cart
     */
    @Delete()
    @ApiOperation({
        summary: 'Clear cart',
        description: 'Remove all items from cart.',
    })
    @ApiResponse({ status: 200, description: 'Cart cleared successfully' })
    async clearCart(@Request() req: any) {
        return await this.cartService.clearCart(req.user._id);
    }
}
