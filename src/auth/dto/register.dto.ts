import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

/**
 * RegisterDto
 *
 * Validation for user registration
 */
const RegisterSchema = z.object({
    /**
     * Email address
     * @example "customer@test.com"
     */
    email: z
        .string()
        .email('Invalid email address')
        .toLowerCase()
        .describe('User email address'),

    /**
     * Password (minimum 8 characters)
     * @example "SecurePass123!"
     */
    password: z
        .string()
        .min(8, 'Password must be at least 8 characters')
        .describe('User password'),

    /**
     * @example "John Doe"
     */
    name: z.string().min(1, 'Name is required').describe('User full name'),
});

export class RegisterDto extends createZodDto(RegisterSchema) { }
