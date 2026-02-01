import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

/**
 * ProductFilterDto
 *
 * Query parameters for filtering, searching, and paginating products.
 *
 * Supports Universal Filtering via filters[key]=value
 */
const ProductFilterSchema = z.object({
    /**
     * Dynamic attribute filters
     * Example: filters[Color]=Red&filters[Size]=42
     */
    filters: z.record(z.string(), z.string()).optional(),

    /**
     * Page number (1-indexed)
     * @example 1
     */
    page: z.coerce.number().min(1).optional().default(1),

    /**
     * Items per page
     * @example 20
     */
    limit: z.coerce.number().min(1).max(100).optional().default(20),

    /**
     * Full-text search query
     * Searches in title and tags
     * @example "nike running"
     */
    search: z.string().optional(),

    /**
     * Filter by category ID
     * @example "64a1b2c3d4e5f6a7b8c9d0e1"
     */
    category: z
        .string()
        .regex(/^[0-9a-fA-F]{24}$/, 'Category must be a valid MongoDB ObjectId')
        .optional(),

    /**
     * Minimum price filter
     * @example 1000
     */
    minPrice: z.coerce.number().min(0).optional(),

    /**
     * Maximum price filter
     * @example 5000
     */
    maxPrice: z.coerce.number().min(0).optional(),
});

export class ProductFilterDto extends createZodDto(ProductFilterSchema) { }
