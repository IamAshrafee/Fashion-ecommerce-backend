import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

/**
 * Product Option Schema
 *
 * Defines a variation axis (Size, Color, Fabric, etc.)
 */
const ProductOptionSchema = z.object({
    /**
     * Option name
     * @example "Color"
     */
    name: z.string().min(1, 'Option name is required'),

    /**
     * Possible values for this option
     * @example ["Red", "Blue", "Green"]
     */
    values: z.array(z.string().min(1)).min(1, 'At least one value is required'),
});

/**
 * Product Variant Schema
 *
 * Represents a single SKU with specific attributes
 */
const ProductVariantSchema = z.object({
    /**
     * Stock Keeping Unit (globally unique)
     * @example "NIKE-AM23-RED-42"
     */
    sku: z
        .string()
        .min(1, 'SKU is required')
        .max(100, 'SKU must not exceed 100 characters')
        .describe('Stock Keeping Unit'),

    /**
     * Dynamic attributes map
     * Keys MUST match product options
     * @example { "Color": "Red", "Size": "42" }
     */
    attributes: z.record(z.string(), z.string()).refine(
        (attrs) => Object.keys(attrs).length > 0,
        {
            message: 'At least one attribute is required',
        },
    ),

    /**
     * Stock quantity
     * @example 15
     */
    stock: z.number().min(0, 'Stock cannot be negative').int(),

    /**
     * Variant price
     * @example 1200
     */
    price: z.number().min(0, 'Price cannot be negative'),

    /**
     * Variant-specific images
     * @example ["http://localhost:9000/product-images/red-shoe.jpg"]
     */
    images: z.array(z.string().url()).optional().default([]),
});

/**
 * CreateProductDto
 *
 * Validation schema for creating products.
 * Custom validation ensures variant attributes match defined options.
 */
const CreateProductSchema = z
    .object({
        /**
         * Product title
         * @example "Nike Air Max 2023"
         */
        title: z
            .string()
            .min(1, 'Title is required')
            .max(200, 'Title must not exceed 200 characters')
            .describe('Product title'),

        /**
         * Product description
         * @example "Premium running shoes with Air Max technology"
         */
        description: z
            .string()
            .min(1, 'Description is required')
            .describe('Product description'),

        /**
         * Base price
         * @example 12000
         */
        basePrice: z.number().min(0, 'Base price cannot be negative'),

        /**
         * Category ID
         * @example "64a1b2c3d4e5f6a7b8c9d0e1"
         */
        category: z
            .string()
            .regex(
                /^[0-9a-fA-F]{24}$/,
                'Category must be a valid MongoDB ObjectId',
            )
            .describe('Category ID'),

        /**
         * Search tags
         * @example ["running", "sports", "nike"]
         */
        tags: z.array(z.string()).optional().default([]),

        /**
         * Variation options
         * @example [{ "name": "Size", "values": ["40", "41", "42"] }]
         */
        options: z.array(ProductOptionSchema).optional().default([]),

        /**
         * Product variants
         * Must have at least one variant
         */
        variants: z
            .array(ProductVariantSchema)
            .min(1, 'At least one variant is required'),
    })
    .refine(
        (data) => {
            // CRITICAL VALIDATION: Ensure variant attributes match options
            // Extract option names from product.options
            const optionNames = new Set(data.options.map((opt) => opt.name));

            // Check each variant
            for (const variant of data.variants) {
                const variantAttrKeys = Object.keys(variant.attributes);

                // Check if variant has any attributes not defined in options
                for (const key of variantAttrKeys) {
                    if (!optionNames.has(key)) {
                        return false; // Invalid attribute found
                    }
                }
            }

            return true;
        },
        {
            message:
                'Variant attributes must match exactly with defined product options. Each variant can only have attributes that are defined in the options array.',
        },
    );

export class CreateProductDto extends createZodDto(CreateProductSchema) { }
