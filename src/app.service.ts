import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): { message: string; version: string; environment: string } {
    return {
      message: 'The Fashion Engine API is running!',
      version: '1.0.0',
      environment: process.env.NODE_ENV || 'development',
    };
  }
}
