import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

/**
 * CreateCategoryDto
 *
 * Validation schema for creating new categories.
 */
const CreateCategorySchema = z.object({
    /**
     * Category name
     * @example "Sarees"
     */
    name: z
        .string()
        .min(1, 'Name is required')
        .max(100, 'Name must not exceed 100 characters')
        .describe('Category name'),

    /**
     * URL-friendly slug (lowercase, alphanumeric with hyphens)
     * @example "ethnic-sarees"
     */
    slug: z
        .string()
        .min(1, 'Slug is required')
        .max(100, 'Slug must not exceed 100 characters')
        .regex(
            /^[a-z0-9-]+$/,
            'Slug must be lowercase alphanumeric with hyphens only',
        )
        .describe('URL-friendly slug'),

    /**
     * Category image URL (optional)
     * @example "http://localhost:9000/product-images/categories/sarees.jpg"
     */
    image: z
        .string()
        .url('Image must be a valid URL')
        .nullable()
        .optional()
        .describe('Category image URL'),

    /**
     * Parent category ID (null for root categories)
     * Must be a valid MongoDB ObjectId
     * @example "64a1b2c3d4e5f6a7b8c9d0e1"
     */
    parentId: z
        .string()
        .regex(/^[0-9a-fA-F]{24}$/, 'Parent ID must be a valid MongoDB ObjectId')
        .nullable()
        .optional()
        .describe('Parent category ID for hierarchy'),
});

export class CreateCategoryDto extends createZodDto(CreateCategorySchema) { }
