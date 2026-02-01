import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

/**
 * Category Schema
 *
 * Hierarchical category structure using self-referencing parentId.
 * Supports infinite nesting (e.g., Women > Ethnic Wear > Sarees).
 *
 * Example Hierarchy:
 * - Women (parentId: null)
 *   - Ethnic Wear (parentId: Women._id)
 *     - Sarees (parentId: Ethnic Wear._id)
 *     - Salwar Kameez (parentId: Ethnic Wear._id)
 *   - Western Wear (parentId: Women._id)
 * - Men (parentId: null)
 *   - Formal (parentId: Men._id)
 */
@Schema({
    timestamps: true,
    collection: 'categories',
})
export class Category {
    /**
     * Category name (e.g., "Sarees", "Ethnic Wear")
     */
    @Prop({ required: true, minlength: 1, maxlength: 100 })
    name: string;

    /**
     * URL-friendly slug (unique, lowercase)
     * Used for SEO-friendly URLs and lookups
     */
    @Prop({ required: true, unique: true, lowercase: true })
    slug: string;

    /**
     * Category image URL (optional)
     * Can be uploaded using IStorageService
     */
    @Prop({ type: String, default: null })
    image: string | null;

    /**
     * Parent category reference (null for root categories)
     * Enables hierarchical tree structure
     */
    @Prop({ type: Types.ObjectId, ref: 'Category', default: null })
    parentId: Types.ObjectId | null;

    createdAt?: Date;
    updatedAt?: Date;
}

export type CategoryDocument = Category & Document;
export const CategorySchema = SchemaFactory.createForClass(Category);

// Indexes for performance
CategorySchema.index({ slug: 1 }, { unique: true });
CategorySchema.index({ parentId: 1 }); // Fast hierarchy queries
