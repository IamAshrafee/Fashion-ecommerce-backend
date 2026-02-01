import {
    Controller,
    Get,
    Post,
    Patch,
    Delete,
    Body,
    Param,
    UseGuards,
} from '@nestjs/common';
import {
    ApiTags,
    ApiOperation,
    ApiResponse,
    ApiParam,
    ApiBearerAuth,
} from '@nestjs/swagger';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../auth/schemas/user.schema';

/**
 * CategoriesController
 *
 * REST API for category management.
 * Write operations will be admin-only in Phase 4 (Auth module).
 */
@Controller('categories')
@ApiTags('Categories')
export class CategoriesController {
    constructor(private readonly categoriesService: CategoriesService) { }

    /**
     * Create Category (ADMIN Only)
     */
    @Post()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN)
    @ApiBearerAuth()
    @ApiOperation({
        summary: 'Create category',
        description: 'Create a new category. Admin only (enforced in Phase 4).',
    })
    @ApiResponse({ status: 201, description: 'Category created successfully' })
    @ApiResponse({ status: 409, description: 'Slug already exists' })
    async create(@Body() createDto: CreateCategoryDto) {
        return await this.categoriesService.create(createDto);
    }

    /**
     * Get All Categories (Flat List)
     */
    @Get()
    @ApiOperation({
        summary: 'Get all categories',
        description: 'Returns flat list of all categories with parent references.',
    })
    @ApiResponse({ status: 200, description: 'Categories retrieved successfully' })
    async findAll() {
        return await this.categoriesService.findAll();
    }

    /**
     * Get Category Tree
     */
    @Get('tree')
    @ApiOperation({
        summary: 'Get category tree',
        description:
            'Returns hierarchical tree structure of categories. Used for navigation menus.',
    })
    @ApiResponse({
        status: 200,
        description: 'Category tree built successfully',
    })
    async getTree() {
        return await this.categoriesService.getTree();
    }

    /**
     * Get Category by ID
     */
    @Get(':id')
    @ApiOperation({
        summary: 'Get category by ID',
        description: 'Retrieve a single category with parent details.',
    })
    @ApiParam({ name: 'id', description: 'Category ID' })
    @ApiResponse({ status: 200, description: 'Category found' })
    @ApiResponse({ status: 404, description: 'Category not found' })
    async findById(@Param('id') id: string) {
        return await this.categoriesService.findById(id);
    }

    /**
     * Update Category (ADMIN Only)
     */
    @Patch(':id')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN)
    @ApiBearerAuth()
    @ApiOperation({
        summary: 'Update category',
        description: 'Update category details. Admin only (enforced in Phase 4).',
    })
    @ApiParam({ name: 'id', description: 'Category ID' })
    @ApiResponse({ status: 200, description: 'Category updated successfully' })
    @ApiResponse({ status: 404, description: 'Category not found' })
    async update(@Param('id') id: string, @Body() updateDto: UpdateCategoryDto) {
        return await this.categoriesService.update(id, updateDto);
    }

    /**
     * Delete Category (ADMIN Only)
     */
    @Delete(':id')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN)
    @ApiBearerAuth()
    @ApiOperation({
        summary: 'Delete category',
        description: 'Delete category. Admin only (enforced in Phase 4).',
    })
    @ApiParam({ name: 'id', description: 'Category ID' })
    @ApiResponse({ status: 200, description: 'Category deleted successfully' })
    @ApiResponse({ status: 404, description: 'Category not found' })
    async delete(@Param('id') id: string) {
        return await this.categoriesService.delete(id);
    }
}
