import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as Minio from 'minio';
import {
    IStorageService,
    StorageUploadResult,
} from '../common/interfaces/storage.interface';

/**
 * MinioStorageService
 *
 * MinIO implementation of the IStorageService interface.
 * Provides S3-compatible object storage for local development and production.
 *
 * @implements {IStorageService}
 */
@Injectable()
export class MinioStorageService implements IStorageService, OnModuleInit {
    private readonly logger = new Logger(MinioStorageService.name);
    private minioClient: Minio.Client;
    private bucketName: string;
    private endpoint: string;
    private port: number;
    private useSSL: boolean;

    constructor(private configService: ConfigService) {
        // Initialize MinIO client configuration
        this.endpoint = this.configService.get<string>('MINIO_ENDPOINT', 'localhost');
        this.port = parseInt(this.configService.get<string>('MINIO_PORT', '9000'), 10);
        // Parse boolean from string (env vars are always strings)
        const useSSLStr = this.configService.get<string>('MINIO_USE_SSL', 'false');
        this.useSSL = useSSLStr === 'true';
        this.bucketName = this.configService.get<string>(
            'MINIO_DEFAULT_BUCKET',
            'product-images',
        );

        this.minioClient = new Minio.Client({
            endPoint: this.endpoint,
            port: this.port,
            useSSL: this.useSSL,
            accessKey: this.configService.get<string>('MINIO_ROOT_USER', 'minioadmin'),
            secretKey: this.configService.get<string>(
                'MINIO_ROOT_PASSWORD',
                'minioadmin123',
            ),
        });
    }

    /**
     * Verify bucket exists on module initialization
     * Logs warning if bucket is missing (should be created by docker-compose setup)
     */
    async onModuleInit() {
        try {
            const exists = await this.minioClient.bucketExists(this.bucketName);
            if (exists) {
                this.logger.log(`✅ Connected to MinIO bucket: ${this.bucketName}`);
            } else {
                this.logger.warn(
                    `⚠️  Bucket '${this.bucketName}' does not exist. Please ensure docker-compose setup ran correctly.`,
                );
            }
        } catch (error) {
            this.logger.error(
                `❌ Failed to connect to MinIO: ${error.message}`,
                error.stack,
            );
        }
    }

    /**
     * Upload a file to MinIO storage
     *
     * @param file - File buffer to upload
     * @param path - Destination path (e.g., 'products/shoe-123.jpg')
     * @param mimetype - MIME type for Content-Type header
     * @returns Upload result with key, full URL, and provider identifier
     */
    async upload(
        file: Buffer,
        path: string,
        mimetype: string,
    ): Promise<StorageUploadResult> {
        try {
            // Upload to MinIO with metadata
            await this.minioClient.putObject(this.bucketName, path, file, file.length, {
                'Content-Type': mimetype,
            });

            this.logger.log(`✅ Uploaded file: ${path}`);

            // Construct public URL
            const protocol = this.useSSL ? 'https' : 'http';
            const url = `${protocol}://${this.endpoint}:${this.port}/${this.bucketName}/${path}`;

            return {
                key: path,
                url: url,
                provider: 'minio',
            };
        } catch (error) {
            this.logger.error(`❌ Failed to upload file: ${path}`, error.stack);
            throw new Error(`File upload failed: ${error.message}`);
        }
    }

    /**
     * Delete a file from MinIO storage
     *
     * @param path - File path/key to delete
     */
    async delete(path: string): Promise<void> {
        try {
            await this.minioClient.removeObject(this.bucketName, path);
            this.logger.log(`🗑️  Deleted file: ${path}`);
        } catch (error) {
            this.logger.error(`❌ Failed to delete file: ${path}`, error.stack);
            throw new Error(`File deletion failed: ${error.message}`);
        }
    }
}
