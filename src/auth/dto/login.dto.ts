import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

/**
 * LoginDto
 *
 * Validation for user login
 */
const LoginSchema = z.object({
    /**
     * Email address
     * @example "customer@test.com"
     */
    email: z.string().email('Invalid email address').toLowerCase(),

    /**
     * Password
     * @example "SecurePass123!"
     */
    password: z.string().min(1, 'Password is required'),
});

export class LoginDto extends createZodDto(LoginSchema) { }
