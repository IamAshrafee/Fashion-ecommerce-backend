import {
    Injectable,
    Logger,
    NotFoundException,
    BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Product, ProductDocument } from './schemas/product.schema';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ProductFilterDto } from './dto/product-filter.dto';

/**
 * ProductsService
 *
 * Handles product CRUD operations and implements the Universal Filtering Protocol.
 */
@Injectable()
export class ProductsService {
    private readonly logger = new Logger(ProductsService.name);

    constructor(
        @InjectModel(Product.name) private productModel: Model<ProductDocument>,
    ) { }

    /**
     * Create Product
     *
     * Validates that variant attributes match product options before saving.
     */
    async create(createDto: CreateProductDto) {
        // Additional service-level validation
        this.validateVariantAttributes(createDto.options, createDto.variants);

        try {
            const product = await this.productModel.create(createDto);
            this.logger.log(`✅ Product created: ${product.title} with ${product.variants.length} variants`);
            return product;
        } catch (error: any) {
            if (error.code === 11000) {
                // Duplicate SKU error
                const duplicateSKU = error.keyValue?.['variants.sku'];
                throw new BadRequestException(
                    `SKU '${duplicateSKU}' already exists. SKUs must be globally unique.`,
                );
            }
            throw error;
        }
    }

    /**
     * Find All Products with Universal Filtering
     *
     * THE CORE INNOVATION: Dynamic attribute filtering without hardcoding.
     *
     * Example Queries:
     * - filters: { "Color": "Red" } → finds products with Red color variants
     * - filters: { "Size": "42", "Color": "Blue" } → finds products with Size 42 AND Blue color
     * - filters: { "Fabric": "Silk" } → finds products with Silk fabric (e.g., Sarees)
     *
     * Generated MongoDB Query:
     * {
     *   'variants.attributes.Color': 'Red',
     *   'variants.attributes.Size': '42'
     * }
     */
    async findAll(filterDto?: ProductFilterDto) {
        const {
            filters = {},
            page = 1,
            limit = 20,
            search,
            category,
            minPrice,
            maxPrice,
        } = filterDto || {};

        const query: any = {};

        // ========================================
        // UNIVERSAL FILTER: Dynamic Attributes
        // ========================================
        if (filters && Object.keys(filters).length > 0) {
            Object.keys(filters).forEach((key) => {
                // Convert filters[Color]=Red to MongoDB query
                query[`variants.attributes.${key}`] = filters[key];
            });

            this.logger.log(
                `🔍 Universal Filter Applied: ${JSON.stringify(filters)}`,
            );
        }

        // ========================================
        // Full-Text Search
        // ========================================
        if (search) {
            query.$text = { $search: search };
        }

        // ========================================
        // Category Filter
        // ========================================
        if (category) {
            query.category = category;
        }

        // ========================================
        // Price Range Filter
        // ========================================
        if (minPrice !== undefined || maxPrice !== undefined) {
            query.basePrice = {};
            if (minPrice !== undefined) {
                query.basePrice.$gte = minPrice;
            }
            if (maxPrice !== undefined) {
                query.basePrice.$lte = maxPrice;
            }
        }

        const skip = (page - 1) * limit;

        // Execute query with pagination
        const [products, total] = await Promise.all([
            this.productModel
                .find(query)
                .populate('category')
                .skip(skip)
                .limit(limit)
                .sort({ createdAt: -1 })
                .exec(),
            this.productModel.countDocuments(query).exec(),
        ]);

        return {
            products,
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
            filters: filters,
        };
    }

    /**
     * Find Product by ID
     */
    async findById(id: string) {
        const product = await this.productModel
            .findById(id)
            .populate('category')
            .exec();

        if (!product) {
            throw new NotFoundException(`Product with ID ${id} not found`);
        }

        return product;
    }

    /**
     * Update Product
     *
     * If updating variants or options, re-validates attribute consistency.
     */
    async update(id: string, updateDto: UpdateProductDto) {
        const existingProduct = await this.productModel.findById(id).exec();

        if (!existingProduct) {
            throw new NotFoundException(`Product with ID ${id} not found`);
        }

        // If updating both options and variants, validate
        if (updateDto.options && updateDto.variants) {
            this.validateVariantAttributes(updateDto.options, updateDto.variants);
        }
        // If updating only variants, validate against existing options
        else if (updateDto.variants) {
            this.validateVariantAttributes(
                existingProduct.options,
                updateDto.variants,
            );
        }

        const product = await this.productModel
            .findByIdAndUpdate(id, updateDto, { new: true })
            .populate('category')
            .exec();

        this.logger.log(`✅ Product updated: ${product?.title}`);
        return product;
    }

    /**
     * Delete Product
     */
    async delete(id: string) {
        const product = await this.productModel.findByIdAndDelete(id).exec();

        if (!product) {
            throw new NotFoundException(`Product with ID ${id} not found`);
        }

        this.logger.log(`🗑️  Product deleted: ${product.title}`);
        return { message: 'Product deleted successfully' };
    }

    /**
     * CRITICAL VALIDATION LOGIC
     *
     * Ensures variant attributes match exactly with product options.
     * Prevents data pollution (e.g., Saree with 'Voltage' attribute).
     *
     * Example:
     * Options: [{ name: "Size", values: [...] }, { name: "Color", values: [...] }]
     * Valid Variant: { attributes: { "Size": "42", "Color": "Red" } }
     * Invalid Variant: { attributes: { "Size": "42", "Fabric": "Silk" } } ← "Fabric" not in options
     */
    private validateVariantAttributes(
        options: any[],
        variants: any[],
    ): void {
        // Extract valid option names
        const validOptionNames = new Set(options.map((opt) => opt.name));

        // Check each variant
        for (const variant of variants) {
            const variantAttrKeys = Object.keys(variant.attributes);

            // Ensure all variant attribute keys are defined in options
            for (const key of variantAttrKeys) {
                if (!validOptionNames.has(key)) {
                    throw new BadRequestException(
                        `Invalid attribute '${key}' in variant SKU '${variant.sku}'. ` +
                        `Valid attributes are: ${Array.from(validOptionNames).join(', ')}. ` +
                        `This validation prevents data pollution (e.g., a Saree accidentally getting a 'Voltage' attribute).`,
                    );
                }
            }

            // Optional: Ensure variant has ALL required option keys (strict mode)
            // Uncomment if you want to enforce that every variant must have all option attributes
            // for (const optionName of validOptionNames) {
            //   if (!variantAttrKeys.includes(optionName)) {
            //     throw new BadRequestException(
            //       `Variant SKU '${variant.sku}' is missing required attribute '${optionName}'`
            //     );
            //   }
            // }
        }

        this.logger.log(
            `✅ Variant attributes validated successfully against options: ${Array.from(validOptionNames).join(', ')}`,
        );
    }
}
