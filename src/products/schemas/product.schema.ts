import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

/**
 * Product Schema - "Smart Variant" Architecture
 *
 * THE UNIVERSAL FASHION PRODUCT MODEL
 *
 * This schema handles ANY fashion product (T-shirts, Sarees, Bangles, etc.)
 * using a dynamic attributes map instead of hardcoded variant fields.
 *
 * Example Use Cases:
 * 1. T-Shirt: attributes = { "Size": "L", "Color": "Blue" }
 * 2. Saree: attributes = { "Fabric": "Silk", "Color": "Maroon", "Blouse": "Included" }
 * 3. Bangle: attributes = { "Diameter": "2.4", "Material": "Gold" }
 *
 * The 'options' array defines what attributes are valid for this product.
 * The 'variants' array contains actual inventory items with specific attribute combinations.
 */

/**
 * Variant Subdocument
 *
 * Represents a single purchasable SKU with specific attributes.
 */
export class ProductVariant {
    /**
     * Stock Keeping Unit - Globally unique identifier
     * @example "NIKE-AM23-RED-42"
     */
    @Prop({ required: true, unique: true })
    sku: string;

    /**
     * Dynamic Attributes Map
     *
     * CRITICAL: Keys must match exactly with product.options[].name
     * Example: { "Color": "Red", "Size": "42" }
     */
    @Prop({ type: Map, of: String, required: true })
    attributes: Map<string, string>;

    /**
     * Available stock quantity
     */
    @Prop({ required: true, min: 0 })
    stock: number;

    /**
     * Variant-specific price (can override basePrice)
     */
    @Prop({ required: true, min: 0 })
    price: number;

    /**
     * Variant-specific image gallery
     * CRITICAL for fashion: Different colors need different images
     */
    @Prop({ type: [String], default: [] })
    images: string[];
}

const ProductVariantSchema = SchemaFactory.createForClass(ProductVariant);

/**
 * Product Option Definition
 *
 * Defines a variation axis (e.g., Size, Color, Fabric)
 */
export class ProductOption {
    /**
     * Option name (e.g., "Size", "Color", "Fabric")
     */
    @Prop({ required: true })
    name: string;

    /**
     * Possible values for this option
     * @example ["Small", "Medium", "Large"]
     */
    @Prop({ type: [String], required: true })
    values: string[];
}

const ProductOptionSchema = SchemaFactory.createForClass(ProductOption);

/**
 * Product Schema
 */
@Schema({
    timestamps: true,
    collection: 'products',
})
export class Product {
    /**
     * Product title
     * @example "Nike Air Max 2023"
     */
    @Prop({ required: true, minlength: 1, maxlength: 200 })
    title: string;

    /**
     * Product description
     */
    @Prop({ required: true })
    description: string;

    /**
     * Base price (can be overridden by variant-specific pricing)
     */
    @Prop({ required: true, min: 0 })
    basePrice: number;

    /**
     * Category reference
     */
    @Prop({ type: Types.ObjectId, ref: 'Category', required: true })
    category: Types.ObjectId;

    /**
     * Search tags
     * @example ["running", "sports", "nike"]
     */
    @Prop({ type: [String], default: [] })
    tags: string[];

    /**
     * Variation Axes Definition
     *
     * Defines what attributes are valid for this product.
     * Variants MUST have attributes matching these options.
     *
     * @example [
     *   { name: "Size", values: ["40", "41", "42"] },
     *   { name: "Color", values: ["Red", "Blue"] }
     * ]
     */
    @Prop({ type: [ProductOptionSchema], default: [] })
    options: ProductOption[];

    /**
     * Product Variants
     *
     * Each variant represents a unique SKU with specific attributes.
     * Validation ensures variant.attributes keys match options[].name
     */
    @Prop({ type: [ProductVariantSchema], required: true })
    variants: ProductVariant[];

    createdAt?: Date;
    updatedAt?: Date;
}

export type ProductDocument = Product & Document;
export const ProductSchema = SchemaFactory.createForClass(Product);

// Indexes for performance
ProductSchema.index({ 'variants.sku': 1 }, { unique: true }); // Global SKU uniqueness
ProductSchema.index({ title: 'text', tags: 'text' }); // Full-text search
ProductSchema.index({ category: 1, basePrice: 1 }); // Category + price filtering
ProductSchema.index({ 'variants.attributes': 1 }); // Dynamic attribute queries
