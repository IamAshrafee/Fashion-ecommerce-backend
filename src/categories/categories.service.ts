import {
    Injectable,
    Logger,
    NotFoundException,
    ConflictException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Category, CategoryDocument } from './schemas/category.schema';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

/**
 * CategoryService
 *
 * Handles category CRUD operations and hierarchical tree building.
 */
@Injectable()
export class CategoriesService {
    private readonly logger = new Logger(CategoriesService.name);

    constructor(
        @InjectModel(Category.name) private categoryModel: Model<CategoryDocument>,
    ) { }

    /**
     * Create a new category
     */
    async create(createDto: CreateCategoryDto) {
        try {
            const category = await this.categoryModel.create(createDto);
            this.logger.log(`✅ Category created: ${category.name} (${category.slug})`);
            return category;
        } catch (error: any) {
            if (error.code === 11000) {
                throw new ConflictException(`Slug '${createDto.slug}' already exists`);
            }
            throw error;
        }
    }

    /**
     * Get all categories (flat list)
     */
    async findAll() {
        return await this.categoryModel.find().populate('parentId').exec();
    }

    /**
     * Get single category by ID
     */
    async findById(id: string) {
        const category = await this.categoryModel
            .findById(id)
            .populate('parentId')
            .exec();

        if (!category) {
            throw new NotFoundException(`Category with ID ${id} not found`);
        }

        return category;
    }

    /**
     * Update category
     */
    async update(id: string, updateDto: UpdateCategoryDto) {
        const category = await this.categoryModel
            .findByIdAndUpdate(id, updateDto, { new: true })
            .exec();

        if (!category) {
            throw new NotFoundException(`Category with ID ${id} not found`);
        }

        this.logger.log(`✅ Category updated: ${category.name}`);
        return category;
    }

    /**
     * Delete category
     *
     * TODO: In production, check for products using this category
     * and prevent deletion or reassign products.
     */
    async delete(id: string) {
        const category = await this.categoryModel.findByIdAndDelete(id).exec();

        if (!category) {
            throw new NotFoundException(`Category with ID ${id} not found`);
        }

        this.logger.log(`🗑️  Category deleted: ${category.name}`);
        return { message: 'Category deleted successfully' };
    }

    /**
     * Get Category Tree
     *
     * Builds hierarchical tree structure from flat category list.
     * Algorithm: O(n) complexity using hash map.
     *
     * Example Output:
     * [
     *   {
     *     _id: "...",
     *     name: "Women",
     *     slug: "women",
     *     children: [
     *       {
     *         _id: "...",
     *         name: "Ethnic Wear",
     *         slug: "ethnic-wear",
     *         children: [
     *           { _id: "...", name: "Sarees", slug: "sarees", children: [] }
     *         ]
     *       }
     *     ]
     *   }
     * ]
     */
    async getTree() {
        const categories = await this.categoryModel.find().exec();

        // Build map for O(1) lookups
        const categoryMap = new Map<string, any>();
        const roots: any[] = [];

        // Initialize map with all categories
        categories.forEach((cat) => {
            categoryMap.set(cat._id.toString(), {
                ...cat.toObject(),
                children: [],
            });
        });

        // Build tree structure by linking parents and children
        categories.forEach((cat) => {
            const node = categoryMap.get(cat._id.toString());

            if (cat.parentId) {
                // Add to parent's children array
                const parent = categoryMap.get(cat.parentId.toString());
                if (parent) {
                    parent.children.push(node);
                } else {
                    // Parent doesn't exist, treat as root
                    roots.push(node);
                }
            } else {
                // Root category (no parent)
                roots.push(node);
            }
        });

        return roots;
    }
}
