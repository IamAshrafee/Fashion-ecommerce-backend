import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type SettingsDocument = HydratedDocument<Settings>;

/**
 * Settings Schema
 *
 * Singleton pattern: Only ONE settings document should exist in the database.
 * Stores white-label configuration for the store.
 *
 * @collection settings
 */
@Schema({
    timestamps: true,
    collection: 'settings',
    versionKey: false,
})
export class Settings {
    /**
     * Store Name
     * Displayed in frontend headers, emails, and invoices
     */
    @Prop({
        required: true,
        type: String,
        default: 'Fashion Store',
    })
    storeName: string;

    /**
     * Currency Symbol
     * Used for price formatting (e.g., "BDT", "USD", "$", "€")
     */
    @Prop({
        required: true,
        type: String,
        default: 'BDT',
    })
    currencySymbol: string;

    /**
     * Shipping Charge
     * Flat rate shipping cost added to orders
     */
    @Prop({
        required: true,
        type: Number,
        default: 60,
    })
    shippingCharge: number;

    /**
     * Logo URL
     * Optional store logo (uploaded via storage service)
     * Null if no logo is set
     */
    @Prop({
        type: String,
        default: null,
    })
    logoUrl: string | null;

    /**
     * Timestamps
     * Automatically managed by Mongoose
     */
    createdAt?: Date;
    updatedAt?: Date;
}

export const SettingsSchema = SchemaFactory.createForClass(Settings);

/**
 * Prevent multiple settings documents
 * Note: This is enforced at service layer, not schema level
 * MongoDB doesn't support "max 1 document" constraint natively
 */
