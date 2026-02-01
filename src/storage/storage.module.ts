import { Module } from '@nestjs/common';
import { MinioStorageService } from './minio-storage.service';

/**
 * StorageModule
 *
 * Provides storage services using the Adapter Pattern.
 *
 * KEY ARCHITECTURAL DECISION:
 * - Uses 'IStorageService' string token for dependency injection
 * - Currently implements MinioStorageService
 * - To swap providers (S3, Cloudinary, etc.), only change the useClass value
 *
 * @example
 * // In any module that needs storage:
 * constructor(@Inject('IStorageService') private storage: IStorageService) {}
 *
 * // To swap to AWS S3:
 * { provide: 'IStorageService', useClass: S3StorageService }
 */
@Module({
    providers: [
        {
            provide: 'IStorageService',
            useClass: MinioStorageService,
        },
    ],
    exports: ['IStorageService'],
})
export class StorageModule { }
