import { SetMetadata } from '@nestjs/common';
import { UserRole } from '../schemas/user.schema';

/**
 * @Roles Decorator
 *
 * Specifies which roles can access a route.
 * Must be used with RolesGuard.
 *
 * @example
 * @Roles(UserRole.ADMIN)
 * @Patch(':id')
 * async updateProduct() {}
 */
export const Roles = (...roles: UserRole[]) => SetMetadata('roles', roles);
