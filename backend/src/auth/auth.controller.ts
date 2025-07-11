import { Controller, Post, Body } from '@nestjs/common';
     import { AuthService } from './auth.service';

     @Controller('auth')
     export class AuthController {
       constructor(private authService: AuthService) {}

       @Post('register')
       async register(
         @Body('email') email: string,
         @Body('password') password: string,
         @Body('role') role: 'ADMIN' | 'CLIENT'
       ) {
         return this.authService.register(email, password, role);
       }

       @Post('login')
       async login(
         @Body('email') email: string,
         @Body('password') password: string
       ) {
         return this.authService.login(email, password);
       }
     }