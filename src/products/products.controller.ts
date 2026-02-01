import {
    Controller,
    Get,
    Post,
    Patch,
    Delete,
    Body,
    Param,
    Query,
    Inject,
    UploadedFile,
    UseInterceptors,
} from '@nestjs/common';
import {
    ApiTags,
    ApiOperation,
    ApiResponse,
    ApiParam,
    ApiQuery,
    ApiConsumes,
    ApiBody,
} from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import type { ProductFilterDto } from './dto/product-filter.dto';
import type { IStorageService } from '../common/interfaces/storage.interface';

/**
 * ProductsController
 *
 * REST API for product management with Universal Filtering support.
 */
@Controller('products')
@ApiTags('Products')
export class ProductsController {
    constructor(
        private readonly productsService: ProductsService,
        @Inject('IStorageService') private readonly storageService: IStorageService,
    ) { }

    /**
     * Create Product
     */
    @Post()
    @ApiOperation({
        summary: 'Create product',
        description:
            'Create a new product with Smart Variant architecture. Admin only (enforced in Phase 4).',
    })
    @ApiResponse({ status: 201, description: 'Product created successfully' })
    @ApiResponse({
        status: 400,
        description: 'Validation error - SKU already exists or invalid attributes',
    })
    async create(@Body() createDto: CreateProductDto) {
        return await this.productsService.create(createDto);
    }

    /**
     * Get All Products with Universal Filtering
     */
    @Get()
    @ApiOperation({
        summary: 'Get all products',
        description:
            'List products with Universal Filtering. Supports dynamic attribute filters (e.g., filters[Color]=Red&filters[Size]=42), pagination, search, and category filtering.',
    })
    @ApiQuery({
        name: 'filters[key]',
        required: false,
        description:
            'Dynamic attribute filters. Example: filters[Color]=Red&filters[Size]=42',
        example: 'filters[Color]=Red',
    })
    @ApiQuery({
        name: 'page',
        required: false,
        type: Number,
        description: 'Page number (1-indexed)',
    })
    @ApiQuery({
        name: 'limit',
        required: false,
        type: Number,
        description: 'Items per page (max 100)',
    })
    @ApiQuery({
        name: 'search',
        required: false,
        type: String,
        description: 'Full-text search in title and tags',
    })
    @ApiQuery({
        name: 'category',
        required: false,
        type: String,
        description: 'Filter by category ID',
    })
    @ApiQuery({
        name: 'minPrice',
        required: false,
        type: Number,
        description: 'Minimum price filter',
    })
    @ApiQuery({
        name: 'maxPrice',
        required: false,
        type: Number,
        description: 'Maximum price filter',
    })
    @ApiResponse({
        status: 200,
        description: 'Products retrieved successfully with pagination',
    })
    async findAll(@Query() filterDto: ProductFilterDto) {
        return await this.productsService.findAll(filterDto);
    }

    /**
     * Get Product by ID
     */
    @Get(':id')
    @ApiOperation({
        summary: 'Get product by ID',
        description: 'Retrieve a single product with all variants and category details.',
    })
    @ApiParam({ name: 'id', description: 'Product ID' })
    @ApiResponse({ status: 200, description: 'Product found' })
    @ApiResponse({ status: 404, description: 'Product not found' })
    async findById(@Param('id') id: string) {
        return await this.productsService.findById(id);
    }

    /**
     * Update Product
     */
    @Patch(':id')
    @ApiOperation({
        summary: 'Update product',
        description:
            'Update product details and/or variants. Admin only (enforced in Phase 4).',
    })
    @ApiParam({ name: 'id', description: 'Product ID' })
    @ApiResponse({ status: 200, description: 'Product updated successfully' })
    @ApiResponse({
        status: 400,
        description: 'Validation error - invalid attributes',
    })
    @ApiResponse({ status: 404, description: 'Product not found' })
    async update(@Param('id') id: string, @Body() updateDto: UpdateProductDto) {
        return await this.productsService.update(id, updateDto);
    }

    /**
     * Delete Product
     */
    @Delete(':id')
    @ApiOperation({
        summary: 'Delete product',
        description: 'Delete product and all variants. Admin only (enforced in Phase 4).',
    })
    @ApiParam({ name: 'id', description: 'Product ID' })
    @ApiResponse({ status: 200, description: 'Product deleted successfully' })
    @ApiResponse({ status: 404, description: 'Product not found' })
    async delete(@Param('id') id: string) {
        return await this.productsService.delete(id);
    }

    /**
     * Upload Product Image
     *
     * Uses IStorageService (Adapter Pattern) for provider-agnostic uploads.
     * Returns { key, url, provider } which can be used in variant.images array.
     */
    @Post('upload-image')
    @UseInterceptors(FileInterceptor('file'))
    @ApiConsumes('multipart/form-data')
    @ApiOperation({
        summary: 'Upload product image',
        description:
            'Upload image for product variants using the Storage Adapter. Returns URL to use in variant images array.',
    })
    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                file: {
                    type: 'string',
                    format: 'binary',
                    description: 'Image file to upload',
                },
            },
        },
    })
    @ApiResponse({
        status: 201,
        description: 'Image uploaded successfully',
        schema: {
            example: {
                key: 'products/1706823456789-sneaker.jpg',
                url: 'http://localhost:9000/product-images/products/1706823456789-sneaker.jpg',
                provider: 'minio',
            },
        },
    })
    @ApiResponse({
        status: 400,
        description: 'No file provided',
    })
    async uploadImage(@UploadedFile() file: Express.Multer.File) {
        if (!file) {
            throw new Error('No file provided');
        }

        const result = await this.storageService.upload(
            file.buffer,
            `products/${Date.now()}-${file.originalname}`,
            file.mimetype,
        );

        return result;
    }
}
