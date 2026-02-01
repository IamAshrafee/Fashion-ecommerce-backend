import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

/**
 * Order Status Enum
 */
export enum OrderStatus {
    PENDING = 'PENDING', // Order created, awaiting payment
    PAID = 'PAID', // Payment confirmed
    SHIPPED = 'SHIPPED', // Order shipped
    DELIVERED = 'DELIVERED', // Order delivered
    CANCELLED = 'CANCELLED', // Order cancelled (stock restored if PENDING)
}

/**
 * OrderItem Subdocument
 *
 * THE SNAPSHOT PATTERN - CRITICAL FOR PRICE INTEGRITY
 *
 * This stores a FROZEN copy of product data at purchase time.
 * If admin changes price from ₹12,000 to ₹15,000, old orders still show ₹12,000.
 */
@Schema({ _id: true })
export class OrderItem {
    /**
     * Product ID (for admin queries only)
     */
    @Prop({ type: Types.ObjectId, ref: 'Product' })
    productId: Types.ObjectId;

    /**
     * Variant SKU (for reference)
     */
    @Prop({ required: true })
    variantSku: string;

    /**
     * Quantity ordered
     */
    @Prop({ required: true, min: 1 })
    quantity: number;

    /**
     * ========================================
     * THE SNAPSHOT - Frozen at Purchase Time
     * ========================================
     *
     * This object contains product data AS IT EXISTED when the order was placed.
     * It MUST NEVER change, even if the product is updated or deleted.
     */
    @Prop({
        type: {
            title: String, // Product title at purchase time
            price: Number, // Variant price at purchase time
            image: String, // Variant image URL at purchase time
            attributes: Object, // Dynamic attributes (Color, Size, etc.) as plain object
        },
        required: true,
    })
    snapshot: {
        title: string;
        price: number;
        image: string;
        attributes: Record<string, string>; // Plain object, NOT Map (for JSON serialization)
    };
}

export const OrderItemSchema = SchemaFactory.createForClass(OrderItem);

/**
 * Order Schema
 *
 * Represents a completed order with snapshot of product data.
 */
@Schema({ timestamps: true, collection: 'orders' })
export class Order {
    /**
     * User ID who placed the order
     */
    @Prop({ type: Types.ObjectId, ref: 'User', required: true })
    userId: Types.ObjectId;

    /**
     * Unique order number
     */
    @Prop({ required: true, unique: true })
    orderNumber: string;

    /**
     * Order items with snapshots
     */
    @Prop({ type: [OrderItemSchema], required: true })
    items: OrderItem[];

    /**
     * Total amount (calculated at order time)
     */
    @Prop({ required: true, min: 0 })
    totalAmount: number;

    /**
     * Order status
     */
    @Prop({ type: String, enum: OrderStatus, default: OrderStatus.PENDING })
    status: OrderStatus;

    /**
     * Shipping address
     */
    @Prop({
        type: {
            street: String,
            city: String,
            state: String,
            zip: String,
            country: String,
        },
        required: true,
    })
    shippingAddress: {
        street: string;
        city: string;
        state: string;
        zip: string;
        country: string;
    };

    createdAt?: Date;
    updatedAt?: Date;
}

export type OrderDocument = Order & Document;
export const OrderSchema = SchemaFactory.createForClass(Order);

// Indexes
OrderSchema.index({ userId: 1 }); // Query user's orders
OrderSchema.index({ orderNumber: 1 }, { unique: true }); // Unique order numbers
OrderSchema.index({ status: 1 }); // Query by status (admin)
OrderSchema.index({ createdAt: -1 }); // Sort by date
