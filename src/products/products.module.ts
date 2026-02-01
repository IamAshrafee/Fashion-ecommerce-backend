import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Product, ProductSchema } from './schemas/product.schema';
import { ProductsService } from './products.service';
import { ProductsController } from './products.controller';
import { StorageModule } from '../storage/storage.module';

/**
 * ProductsModule
 *
 * Provides Smart Variant product management with Universal Filtering.
 */
@Module({
    imports: [
        MongooseModule.forFeature([{ name: Product.name, schema: ProductSchema }]),
        StorageModule, // For image uploads
    ],
    controllers: [ProductsController],
    providers: [ProductsService],
    exports: [ProductsService], // Export for use in other modules (Orders, Cart, etc.)
})
export class ProductsModule { }
