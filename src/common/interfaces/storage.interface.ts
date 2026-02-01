/**
 * Storage Upload Result
 * Contains all information needed for both backend and frontend storage handling
 */
export interface StorageUploadResult {
    /**
     * Storage key/path used to reference the file
     * Provider-agnostic identifier
     */
    key: string;

    /**
     * Full public URL to access the file
     * Can be used directly in frontend without reconstruction
     */
    url: string;

    /**
     * Provider identifier (e.g., 'minio', 's3', 'cloudinary')
     * Useful for debugging and provider-specific logic
     */
    provider: string;
}

/**
 * IStorageService Interface
 * 
 * Generic storage abstraction following the Adapter Pattern.
 * Allows swapping storage providers (MinIO, AWS S3, Cloudinary, etc.) 
 * without modifying business logic.
 * 
 * @example
 * // In storage.module.ts, change provider with one line:
 * { provide: 'IStorageService', useClass: MinioStorageService }
 * // to
 * { provide: 'IStorageService', useClass: S3StorageService }
 */
export interface IStorageService {
    /**
     * Upload a file to storage
     * 
     * @param file - File buffer
     * @param path - Destination path/key (e.g., 'products/shoe-123.jpg')
     * @param mimetype - MIME type (e.g., 'image/jpeg')
     * @returns Upload result containing key, URL, and provider
     * 
     * @example
     * const result = await storage.upload(buffer, 'products/item.jpg', 'image/jpeg');
     * // Save result.key to database
     * // Return result.url to frontend
     */
    upload(
        file: Buffer,
        path: string,
        mimetype: string,
    ): Promise<StorageUploadResult>;

    /**
     * Delete a file from storage
     * 
     * @param path - File path/key to delete
     * 
     * @example
     * await storage.delete('products/old-image.jpg');
     */
    delete(path: string): Promise<void>;
}
