import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

/**
 * CartItem Subdocument
 */
@Schema({ _id: true })
export class CartItem {
    _id?: Types.ObjectId;

    @Prop({ type: Types.ObjectId, ref: 'Product', required: true })
    productId: Types.ObjectId;

    @Prop({ required: true })
    variantSku: string;

    @Prop({ required: true, min: 1 })
    quantity: number;
}

export const CartItemSchema = SchemaFactory.createForClass(CartItem);

/**
 * Cart Schema
 *
 * Persistent cart stored in database (multi-device support).
 * One cart per user.
 */
@Schema({ timestamps: true, collection: 'carts' })
export class Cart {
    /**
     * User ID (one cart per user)
     */
    @Prop({ type: Types.ObjectId, ref: 'User', required: true, unique: true })
    userId: Types.ObjectId;

    /**
     * Cart items
     */
    @Prop({ type: [CartItemSchema], default: [] })
    items: CartItem[];

    createdAt?: Date;
    updatedAt?: Date;
}

export type CartDocument = Cart & Document;
export const CartSchema = SchemaFactory.createForClass(Cart);

// Indexes
CartSchema.index({ userId: 1 }, { unique: true }); // One cart per user
