import { Injectable, Logger } from '@nestjs/common';
import { SettingsService } from '../settings/settings.service';
import { CategoriesService } from '../categories/categories.service';
import { ProductsService } from '../products/products.service';
import { AuthService } from '../auth/auth.service';

/**
 * SeedService
 *
 * Handles database seeding for initial setup and development.
 * Ensures all required singleton documents exist with default values.
 */
@Injectable()
export class SeedService {
    private readonly logger = new Logger(SeedService.name);

    constructor(
        private readonly settingsService: SettingsService,
        private readonly categoriesService: CategoriesService,
        private readonly productsService: ProductsService,
        private readonly authService: AuthService,
    ) { }

    /**
     * Seed All Data
     *
     * Master method that runs all seeding operations.
     * Safe to run multiple times (idempotent).
     */
    async seedAll(): Promise<void> {
        this.logger.log('🌱 Starting database seeding...');

        await this.seedSettings();
        await this.seedUsers();
        await this.seedCatalog();

        this.logger.log('✅ Database seeding completed successfully!');
    }

    /**
     * Seed Settings
     *
     * Creates default settings document if none exists.
     */
    async seedSettings(): Promise<void> {
        this.logger.log('📋 Seeding settings...');
        await this.settingsService.ensureSettingsExist();
    }

    /**
     * Seed Users
     *
     * Creates test users for authentication and RBAC testing:
     * - Admin user (can manage products, categories, settings)
     * - Customer user (can manage own cart and orders)
     */
    async seedUsers(): Promise<void> {
        this.logger.log('👥 Seeding users...');

        try {
            // Admin user
            await this.authService.register({
                email: 'admin@test.com',
                password: 'admin123',
                name: 'Admin User',
            });
            this.logger.log('✅ Admin user created: admin@test.com / admin123');
        } catch (error) {
            if (error.message?.includes('already exists') || error.response?.message?.includes('already exists')) {
                this.logger.log('ℹ️  Admin user already exists');
            } else {
                this.logger.error('❌ Admin seed failed:', JSON.stringify(error.response || error.message, null, 2));
                throw error;
            }
        }

        try {
            // Customer user
            await this.authService.register({
                email: 'customer@test.com',
                password: 'customer123',
                name: 'John Doe',
            });
            this.logger.log('✅ Customer user created: customer@test.com / customer123');
        } catch (error) {
            if (error.message?.includes('already exists') || error.response?.message?.includes('already exists')) {
                this.logger.log('ℹ️  Customer user already exists');
            } else {
                this.logger.error('❌ Customer seed failed:', JSON.stringify(error.response || error.message, null, 2));
                throw error;
            }
        }
    }

    /**
     * Seed Catalog
     *
     * Creates category hierarchy and sample products.
     * Demonstrates Smart Variant architecture with diverse products:
     * - Sneaker (Size/Color)
     * - Saree (Fabric/Color/Blouse)
     * - Bangle (Diameter/Material)
     */
    async seedCatalog(): Promise<void> {
        this.logger.log('📦 Seeding catalog (categories and products)...');

        // Check if catalog already seeded
        const existingCategories = await this.categoriesService.findAll();
        if (existingCategories.length > 0) {
            this.logger.log('ℹ️  Catalog already seeded. Skipping...');
            return;
        }

        // Create category hierarchy: Women > Ethnic Wear > Sarees
        const women = await this.categoriesService.create({
            name: 'Women',
            slug: 'women',
            image: null,
            parentId: null,
        });

        const ethnicWear = await this.categoriesService.create({
            name: 'Ethnic Wear',
            slug: 'ethnic-wear',
            image: null,
            parentId: women._id.toString(),
        });

        const sarees = await this.categoriesService.create({
            name: 'Sarees',
            slug: 'sarees',
            image: null,
            parentId: ethnicWear._id.toString(),
        });

        // Create Men category and subcategories
        const men = await this.categoriesService.create({
            name: 'Men',
            slug: 'men',
            image: null,
            parentId: null,
        });

        const footwear = await this.categoriesService.create({
            name: 'Footwear',
            slug: 'footwear',
            image: null,
            parentId: men._id.toString(),
        });

        // Create Jewelry category
        const jewelry = await this.categoriesService.create({
            name: 'Jewelry',
            slug: 'jewelry',
            image: null,
            parentId: women._id.toString(),
        });

        this.logger.log('✅ Category hierarchy created');

        // ========================================
        // PRODUCT 1: Sneakers (Size/Color)
        // ========================================
        await this.productsService.create({
            title: 'Nike Air Max 2023',
            description:
                'Premium running shoes with Air Max technology for superior comfort and performance.',
            basePrice: 12000,
            category: footwear._id.toString(),
            tags: ['running', 'sports', 'nike', 'sneakers'],
            options: [
                { name: 'Size', values: ['40', '41', '42', '43'] },
                { name: 'Color', values: ['Red', 'Blue', 'Black'] },
            ],
            variants: [
                {
                    sku: 'NIKE-AM23-RED-42',
                    attributes: { Size: '42', Color: 'Red' },
                    stock: 15,
                    price: 12000,
                    images: [],
                },
                {
                    sku: 'NIKE-AM23-BLUE-42',
                    attributes: { Size: '42', Color: 'Blue' },
                    stock: 8,
                    price: 12000,
                    images: [],
                },
                {
                    sku: 'NIKE-AM23-BLACK-43',
                    attributes: { Size: '43', Color: 'Black' },
                    stock: 12,
                    price: 12000,
                    images: [],
                },
            ],
        });

        // ========================================
        // PRODUCT 2: Saree (Fabric/Color/Blouse)
        // ========================================
        await this.productsService.create({
            title: 'Bengali Jamdani Saree',
            description:
                'Traditional handwoven saree with intricate Jamdani patterns. Authentic Bengali craftsmanship.',
            basePrice: 8500,
            category: sarees._id.toString(),
            tags: ['ethnic', 'saree', 'traditional', 'handwoven', 'bengali'],
            options: [
                { name: 'Fabric', values: ['Silk', 'Cotton'] },
                { name: 'Color', values: ['Maroon', 'White', 'Red'] },
                { name: 'Blouse', values: ['Included', 'Not Included'] },
            ],
            variants: [
                {
                    sku: 'SAREE-JAM-SLK-MAR-INC',
                    attributes: { Fabric: 'Silk', Color: 'Maroon', Blouse: 'Included' },
                    stock: 3,
                    price: 8500,
                    images: [],
                },
                {
                    sku: 'SAREE-JAM-CTN-WHT-NINC',
                    attributes: { Fabric: 'Cotton', Color: 'White', Blouse: 'Not Included' },
                    stock: 5,
                    price: 6500,
                    images: [],
                },
                {
                    sku: 'SAREE-JAM-SLK-RED-INC',
                    attributes: { Fabric: 'Silk', Color: 'Red', Blouse: 'Included' },
                    stock: 2,
                    price: 8500,
                    images: [],
                },
            ],
        });

        // ========================================
        // PRODUCT 3: Bangle Set (Diameter/Material)
        // ========================================
        await this.productsService.create({
            title: 'Designer Gold-Plated Bangle Set',
            description:
                'Elegant set of 4 bangles with intricate design. Perfect for special occasions.',
            basePrice: 2500,
            category: jewelry._id.toString(),
            tags: ['jewelry', 'bangles', 'gold-plated', 'traditional'],
            options: [
                { name: 'Diameter', values: ['2.2', '2.4', '2.6', '2.8'] },
                { name: 'Material', values: ['Gold Plated', 'Silver Plated'] },
            ],
            variants: [
                {
                    sku: 'BANGLE-SET-GOLD-24',
                    attributes: { Diameter: '2.4', Material: 'Gold Plated' },
                    stock: 10,
                    price: 2500,
                    images: [],
                },
                {
                    sku: 'BANGLE-SET-SILVER-24',
                    attributes: { Diameter: '2.4', Material: 'Silver Plated' },
                    stock: 15,
                    price: 1800,
                    images: [],
                },
                {
                    sku: 'BANGLE-SET-GOLD-26',
                    attributes: { Diameter: '2.6', Material: 'Gold Plated' },
                    stock: 8,
                    price: 2500,
                    images: [],
                },
            ],
        });

        this.logger.log('✅ Sample products created (Sneaker, Saree, Bangle)');
    }
}
