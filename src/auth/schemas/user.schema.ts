import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

/**
 * User Roles for RBAC
 */
export enum UserRole {
    ADMIN = 'ADMIN',
    CUSTOMER = 'CUSTOMER',
}

/**
 * User Schema
 *
 * Handles authentication and role-based access control.
 */
@Schema({ timestamps: true, collection: 'users' })
export class User {
    /**
     * Email address (unique, lowercase)
     */
    @Prop({ required: true, unique: true, lowercase: true })
    email: string;

    /**
     * Hashed password (bcrypt)
     */
    @Prop({ required: true, select: false })
    password: string;

    /**
     * User's full name
     */
    @Prop({ required: true })
    name: string;

    /**
     * User role for RBAC
     * ADMIN: Can manage products, categories, settings, orders
     * CUSTOMER: Can manage own cart, orders, profile
     */
    @Prop({ type: String, enum: UserRole, default: UserRole.CUSTOMER })
    role: UserRole;

    createdAt?: Date;
    updatedAt?: Date;
}

export type UserDocument = User & Document;
export const UserSchema = SchemaFactory.createForClass(User);

// Indexes
UserSchema.index({ email: 1 }, { unique: true });
