import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

/**
 * Product Option Schema (for updates)
 */
const ProductOptionSchema = z.object({
    name: z.string().min(1),
    values: z.array(z.string().min(1)).min(1),
});

/**
 * Product Variant Schema (for updates)
 */
const ProductVariantSchema = z.object({
    sku: z.string().min(1).max(100),
    attributes: z.record(z.string(), z.string()).refine(
        (attrs) => Object.keys(attrs).length > 0,
        {
            message: 'At least one attribute is required',
        },
    ),
    stock: z.number().min(0).int(),
    price: z.number().min(0),
    images: z.array(z.string().url()).optional().default([]),
});

/**
 * UpdateProductDto
 *
 * All fields optional for partial updates.
 * Same validation logic as CreateProductDto for variant attributes.
 */
const UpdateProductSchema = z
    .object({
        title: z.string().min(1).max(200).optional(),
        description: z.string().min(1).optional(),
        basePrice: z.number().min(0).optional(),
        category: z
            .string()
            .regex(/^[0-9a-fA-F]{24}$/, 'Category must be a valid MongoDB ObjectId')
            .optional(),
        tags: z.array(z.string()).optional(),
        options: z.array(ProductOptionSchema).optional(),
        variants: z.array(ProductVariantSchema).optional(),
    })
    .refine(
        (data) => {
            // If both options and variants are being updated, validate consistency
            if (data.options && data.variants) {
                const optionNames = new Set(data.options.map((opt) => opt.name));

                for (const variant of data.variants) {
                    const variantAttrKeys = Object.keys(variant.attributes);

                    for (const key of variantAttrKeys) {
                        if (!optionNames.has(key)) {
                            return false;
                        }
                    }
                }
            }

            return true;
        },
        {
            message:
                'Variant attributes must match exactly with defined product options',
        },
    );

export class UpdateProductDto extends createZodDto(UpdateProductSchema) { }
