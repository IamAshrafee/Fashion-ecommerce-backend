import {
    Injectable,
    NotFoundException,
    BadRequestException,
    Logger,
} from '@nestjs/common';
import { InjectModel, InjectConnection } from '@nestjs/mongoose';
import { Model, Connection } from 'mongoose';
import { Cart, CartDocument } from './schemas/cart.schema';
import { Product, ProductDocument } from '../products/schemas/product.schema';
import { AddToCartDto } from './dto/add-to-cart.dto';
import { UpdateCartItemDto } from './dto/update-cart-item.dto';

/**
 * CartService
 *
 * Manages user carts with STRICT stock validation.
 */
@Injectable()
export class CartService {
    private readonly logger = new Logger(CartService.name);

    constructor(
        @InjectModel(Cart.name) private cartModel: Model<CartDocument>,
        @InjectModel(Product.name) private productModel: Model<ProductDocument>,
    ) { }

    /**
     * Add item to cart
     * CRITICAL: Validates stock before adding
     */
    async addToCart(userId: string, dto: AddToCartDto) {
        // Fetch product
        const product = await this.productModel.findById(dto.productId);
        if (!product) {
            throw new NotFoundException(`Product ${dto.productId} not found`);
        }

        // Find variant
        const variant = product.variants.find((v) => v.sku === dto.variantSku);
        if (!variant) {
            throw new NotFoundException(
                `Variant ${dto.variantSku} not found in product ${product.title}`,
            );
        }

        // ========================================
        // CRITICAL: Stock Validation
        // ========================================
        if (variant.stock < dto.quantity) {
            throw new BadRequestException(
                `Insufficient stock for ${product.title} (${dto.variantSku}). ` +
                `Available: ${variant.stock}, Requested: ${dto.quantity}`,
            );
        }

        // Find or create cart
        let cart = await this.cartModel.findOne({ userId });
        if (!cart) {
            cart = await this.cartModel.create({ userId, items: [] });
        }

        // Check if item already in cart
        const existingItemIndex = cart.items.findIndex(
            (item) =>
                item.productId.toString() === dto.productId && item.variantSku === dto.variantSku,
        );

        if (existingItemIndex >= 0) {
            // Update quantity (re-validate stock)
            const existingItem = cart.items[existingItemIndex];
            const newQuantity = existingItem.quantity + dto.quantity;

            if (variant.stock < newQuantity) {
                throw new BadRequestException(
                    `Insufficient stock for ${product.title} (${dto.variantSku}). ` +
                    `Available: ${variant.stock}, Already in cart: ${existingItem.quantity}, ` +
                    `Trying to add: ${dto.quantity}, Total would be: ${newQuantity}`,
                );
            }

            cart.items[existingItemIndex].quantity = newQuantity;
        } else {
            // Add new item
            cart.items.push({
                productId: dto.productId as any,
                variantSku: dto.variantSku,
                quantity: dto.quantity,
            });
        }

        await cart.save();

        this.logger.log(
            `✅ Added to cart: User ${userId}, Product ${product.title}, SKU ${dto.variantSku}, Qty ${dto.quantity}`,
        );

        return await this.getCart(userId);
    }

    /**
     * Get user's cart with populated product details
     */
    async getCart(userId: string) {
        const cart = await this.cartModel
            .findOne({ userId })
            .populate('items.productId')
            .exec();

        if (!cart) {
            // Return empty cart if not found
            return {
                userId,
                items: [],
                totalItems: 0,
                totalAmount: 0,
            };
        }

        // Calculate totals
        let totalAmount = 0;
        const populatedItems = cart.items.map((item: any) => {
            const product = item.productId;
            const variant = product.variants.find((v: any) => v.sku === item.variantSku);

            const itemTotal = variant ? variant.price * item.quantity : 0;
            totalAmount += itemTotal;

            return {
                _id: item._id,
                product: {
                    _id: product._id,
                    title: product.title,
                    image: variant?.images[0] || null,
                },
                variantSku: item.variantSku,
                quantity: item.quantity,
                price: variant?.price || 0,
                stock: variant?.stock || 0,
                attributes: variant?.attributes || {},
                itemTotal,
            };
        });

        return {
            userId,
            items: populatedItems,
            totalItems: cart.items.length,
            totalAmount,
        };
    }

    /**
     * Update cart item quantity
     * CRITICAL: Validates stock before updating
     */
    async updateCartItem(userId: string, itemId: string, dto: UpdateCartItemDto) {
        const cart = await this.cartModel.findOne({ userId });
        if (!cart) {
            throw new NotFoundException('Cart not found');
        }

        const itemIndex = cart.items.findIndex((item) => item._id!.toString() === itemId);
        if (itemIndex === -1) {
            throw new NotFoundException('Item not found in cart');
        }

        const cartItem = cart.items[itemIndex];

        // Fetch product and variant
        const product = await this.productModel.findById(cartItem.productId);
        if (!product) {
            throw new NotFoundException('Product not found');
        }

        const variant = product.variants.find((v) => v.sku === cartItem.variantSku);
        if (!variant) {
            throw new NotFoundException('Variant not found');
        }

        // ========================================
        // CRITICAL: Stock Validation
        // ========================================
        if (variant.stock < dto.quantity) {
            throw new BadRequestException(
                `Insufficient stock for ${product.title} (${cartItem.variantSku}). ` +
                `Available: ${variant.stock}, Requested: ${dto.quantity}`,
            );
        }

        // Update quantity
        cart.items[itemIndex].quantity = dto.quantity;
        await cart.save();

        this.logger.log(
            `✅ Updated cart item: User ${userId}, SKU ${cartItem.variantSku}, New Qty ${dto.quantity}`,
        );

        return await this.getCart(userId);
    }

    /**
     * Remove item from cart
     */
    async removeCartItem(userId: string, itemId: string) {
        const cart = await this.cartModel.findOne({ userId });
        if (!cart) {
            throw new NotFoundException('Cart not found');
        }

        const itemIndex = cart.items.findIndex((item) => item._id!.toString() === itemId);
        if (itemIndex === -1) {
            throw new NotFoundException('Item not found in cart');
        }

        cart.items.splice(itemIndex, 1);
        await cart.save();

        this.logger.log(`✅ Removed cart item: User ${userId}, Item ID ${itemId}`);

        return await this.getCart(userId);
    }

    /**
     * Clear entire cart
     */
    async clearCart(userId: string) {
        await this.cartModel.updateOne({ userId }, { $set: { items: [] } });

        this.logger.log(`✅ Cleared cart: User ${userId}`);

        return {
            userId,
            items: [],
            totalItems: 0,
            totalAmount: 0,
        };
    }
}
