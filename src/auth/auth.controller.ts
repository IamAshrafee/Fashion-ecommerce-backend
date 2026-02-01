import { Controller, Post, Get, Body, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

/**
 * AuthController
 *
 * REST API for authentication (register, login, profile).
 */
@Controller('auth')
@ApiTags('Authentication')
export class AuthController {
    constructor(private readonly authService: AuthService) { }

    /**
     * Register new user
     */
    @Post('register')
    @ApiOperation({
        summary: 'Register new user',
        description: 'Create a new user account. Default role: CUSTOMER.',
    })
    @ApiResponse({ status: 201, description: 'User registered successfully' })
    @ApiResponse({ status: 409, description: 'Email already exists' })
    async register(@Body() dto: RegisterDto) {
        return await this.authService.register(dto);
    }

    /**
     * Login user
     */
    @Post('login')
    @ApiOperation({
        summary: 'Login user',
        description: 'Authenticate user and receive JWT access token.',
    })
    @ApiResponse({
        status: 200,
        description: 'Login successful',
        schema: {
            example: {
                access_token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
                user: {
                    id: '123',
                    email: 'customer@test.com',
                    name: 'John Doe',
                    role: 'CUSTOMER',
                },
            },
        },
    })
    @ApiResponse({ status: 401, description: 'Invalid credentials' })
    async login(@Body() dto: LoginDto) {
        return await this.authService.login(dto);
    }

    /**
     * Get current user profile
     */
    @Get('profile')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({
        summary: 'Get current user profile',
        description: 'Retrieve authenticated user information. Requires JWT token.',
    })
    @ApiResponse({
        status: 200,
        description: 'User profile retrieved',
        schema: {
            example: {
                id: '123',
                email: 'customer@test.com',
                name: 'John Doe',
                role: 'CUSTOMER',
                createdAt: '2026-02-02T00:00:00.000Z',
            },
        },
    })
    @ApiResponse({ status: 401, description: 'Unauthorized - Invalid or missing token' })
    async getProfile(@Request() req: any) {
        const user = req.user;
        return {
            id: user._id,
            email: user.email,
            name: user.name,
            role: user.role,
            createdAt: user.createdAt,
        };
    }
}
