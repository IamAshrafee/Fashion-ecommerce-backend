import {
    Injectable,
    NotFoundException,
    BadRequestException,
    Logger,
} from '@nestjs/common';
import { InjectModel, InjectConnection } from '@nestjs/mongoose';
import { Model, Connection } from 'mongoose';
import { Order, OrderDocument, OrderStatus } from './schemas/order.schema';
import { Cart, CartDocument } from '../cart/schemas/cart.schema';
import { Product, ProductDocument } from '../products/schemas/product.schema';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';

/**
 * OrdersService
 *
 * THE CRITICAL SERVICE - Handles order creation with:
 * 1. Snapshot Pattern - Freeze product data at purchase time
 * 2. Atomic Transactions - Rollback stock if order fails
 * 3. Stock Validation - Prevent overselling
 *
 * This is a FINANCIAL SYSTEM. Data integrity is NON-NEGOTIABLE.
 */
@Injectable()
export class OrdersService {
    private readonly logger = new Logger(OrdersService.name);

    constructor(
        @InjectModel(Order.name) private orderModel: Model<OrderDocument>,
        @InjectModel(Cart.name) private cartModel: Model<CartDocument>,
        @InjectModel(Product.name) private productModel: Model<ProductDocument>,
        @InjectConnection() private connection: Connection,
    ) { }

    /**
     * ========================================
     * CREATE ORDER - THE ATOMIC TRANSACTION
     * ========================================
     *
     * This method implements a Mongoose transaction that ensures:
     * - Stock is decremented atomically
     * - If order creation fails, stock is automatically restored
     * - Product data is snapshot at purchase time
     * - Cart is cleared after successful order
     *
     * CRITICAL: This prevents "ghost" stock reduction where stock is gone but no order exists.
     */
    async createOrder(userId: string, dto: CreateOrderDto) {
        const session = await this.connection.startSession();
        session.startTransaction();

        try {
            this.logger.log(`🔄 Starting order creation for user ${userId}`);

            // Get user's cart
            const cart = await this.cartModel.findOne({ userId }).session(session);
            if (!cart || cart.items.length === 0) {
                throw new BadRequestException('Cart is empty. Cannot create order.');
            }

            const orderItems: any[] = [];
            let totalAmount = 0;

            // Process each cart item
            for (const cartItem of cart.items) {
                // Fetch product
                const product = await this.productModel
                    .findById(cartItem.productId)
                    .session(session);

                if (!product) {
                    throw new NotFoundException(`Product ${cartItem.productId} not found`);
                }

                // Find variant
                const variantIndex = product.variants.findIndex(
                    (v) => v.sku === cartItem.variantSku,
                );

                if (variantIndex === -1) {
                    throw new NotFoundException(
                        `Variant ${cartItem.variantSku} not found in product ${product.title}`,
                    );
                }

                const variant = product.variants[variantIndex];

                // ========================================
                // CRITICAL: Stock Validation
                // ========================================
                if (variant.stock < cartItem.quantity) {
                    throw new BadRequestException(
                        `Insufficient stock for ${product.title} (${cartItem.variantSku}). ` +
                        `Available: ${variant.stock}, Requested: ${cartItem.quantity}. ` +
                        `Stock may have changed since adding to cart.`,
                    );
                }

                // ========================================
                // CRITICAL: Decrement Stock Atomically
                // ========================================
                const updateResult = await this.productModel.updateOne(
                    {
                        _id: product._id,
                        'variants.sku': cartItem.variantSku,
                        'variants.stock': { $gte: cartItem.quantity }, // Double-check stock
                    },
                    {
                        $inc: { 'variants.$.stock': -cartItem.quantity },
                    },
                    { session },
                );

                if (updateResult.modifiedCount === 0) {
                    throw new BadRequestException(
                        `Failed to reserve stock for ${product.title} (${cartItem.variantSku}). ` +
                        `Stock may have been purchased by another customer.`,
                    );
                }

                this.logger.log(
                    `✅ Stock decremented: ${product.title} (${cartItem.variantSku}), Qty: ${cartItem.quantity}`,
                );

                // ========================================
                // CRITICAL: Create Snapshot
                // ========================================
                const variantImage = variant.images[0] || null;

                // Convert Map to plain object for JSON serialization
                const attributesObject: Record<string, string> = {};
                if (variant.attributes) {
                    variant.attributes.forEach((value, key) => {
                        attributesObject[key] = value;
                    });
                }

                orderItems.push({
                    productId: product._id,
                    variantSku: variant.sku,
                    quantity: cartItem.quantity,
                    snapshot: {
                        title: product.title,
                        price: variant.price,
                        image: variantImage,
                        attributes: attributesObject, // Plain object, NOT Map
                    },
                });

                totalAmount += variant.price * cartItem.quantity;
            }

            // Generate unique order number
            const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 5).toUpperCase()}`;

            // Create order
            const orderData = {
                userId,
                orderNumber,
                items: orderItems,
                totalAmount,
                status: OrderStatus.PENDING,
                shippingAddress: dto.shippingAddress,
            };

            const orders = await this.orderModel.create([orderData], { session });
            const order = orders[0];

            // Clear cart
            await this.cartModel.updateOne(
                { userId },
                { $set: { items: [] } },
                { session },
            );

            // ========================================
            // CRITICAL: Commit Transaction
            // ========================================
            await session.commitTransaction();

            this.logger.log(
                `✅ Order ${orderNumber} created successfully! Items: ${orderItems.length}, Total: ₹${totalAmount}`,
            );

            return await this.findById(order._id.toString(), userId);
        } catch (error) {
            // ========================================
            // CRITICAL: Rollback on Error
            // ========================================
            await session.abortTransaction();
            this.logger.error(
                `❌ Order creation failed. Transaction rolled back. Stock restored.`,
                error.stack,
            );
            throw error;
        } finally {
            session.endSession();
        }
    }

    /**
     * Get all orders for a user
     */
    async findAll(userId: string) {
        const orders = await this.orderModel
            .find({ userId })
            .sort({ createdAt: -1 })
            .exec();

        return orders;
    }

    /**
     * Get single order by ID
     */
    async findById(orderId: string, userId: string) {
        const order = await this.orderModel.findOne({ _id: orderId, userId }).exec();

        if (!order) {
            throw new NotFoundException('Order not found');
        }

        return order;
    }

    /**
     * Update order status (ADMIN only)
     */
    async updateStatus(orderId: string, dto: UpdateOrderStatusDto) {
        const order = await this.orderModel.findById(orderId);

        if (!order) {
            throw new NotFoundException('Order not found');
        }

        order.status = dto.status;
        await order.save();

        this.logger.log(`✅ Order ${order.orderNumber} status updated to ${dto.status}`);

        return order;
    }

    /**
     * Cancel order (restore stock if PENDING)
     */
    async cancelOrder(orderId: string, userId: string) {
        const session = await this.connection.startSession();
        session.startTransaction();

        try {
            const order = await this.orderModel
                .findOne({ _id: orderId, userId })
                .session(session);

            if (!order) {
                throw new NotFoundException('Order not found');
            }

            if (order.status !== OrderStatus.PENDING) {
                throw new BadRequestException(
                    `Cannot cancel order with status ${order.status}. Only PENDING orders can be cancelled.`,
                );
            }

            // Restore stock for each item
            for (const item of order.items) {
                await this.productModel.updateOne(
                    { _id: item.productId, 'variants.sku': item.variantSku },
                    { $inc: { 'variants.$.stock': item.quantity } },
                    { session },
                );

                this.logger.log(
                    `✅ Stock restored: SKU ${item.variantSku}, Qty: ${item.quantity}`,
                );
            }

            // Update order status
            order.status = OrderStatus.CANCELLED;
            await order.save({ session });

            await session.commitTransaction();

            this.logger.log(`✅ Order ${order.orderNumber} cancelled. Stock restored.`);

            return order;
        } catch (error) {
            await session.abortTransaction();
            this.logger.error('❌ Order cancellation failed', error.stack);
            throw error;
        } finally {
            session.endSession();
        }
    }
}
