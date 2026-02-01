import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

/**
 * UpdateCategoryDto
 *
 * All fields optional for partial updates via PATCH.
 */
const UpdateCategorySchema = z.object({
    /**
     * Category name
     * @example "Premium Sarees"
     */
    name: z
        .string()
        .min(1, 'Name must not be empty')
        .max(100, 'Name must not exceed 100 characters')
        .optional()
        .describe('Category name'),

    /**
     * URL-friendly slug
     * @example "premium-sarees"
     */
    slug: z
        .string()
        .min(1, 'Slug must not be empty')
        .max(100, 'Slug must not exceed 100 characters')
        .regex(
            /^[a-z0-9-]+$/,
            'Slug must be lowercase alphanumeric with hyphens only',
        )
        .optional()
        .describe('URL-friendly slug'),

    /**
     * Category image URL
     * @example "http://localhost:9000/product-images/categories/premium-sarees.jpg"
     */
    image: z
        .string()
        .url('Image must be a valid URL')
        .nullable()
        .optional()
        .describe('Category image URL'),

    /**
     * Parent category ID
     * @example "64a1b2c3d4e5f6a7b8c9d0e1"
     */
    parentId: z
        .string()
        .regex(/^[0-9a-fA-F]{24}$/, 'Parent ID must be a valid MongoDB ObjectId')
        .nullable()
        .optional()
        .describe('Parent category ID for hierarchy'),
});

export class UpdateCategoryDto extends createZodDto(UpdateCategorySchema) { }
