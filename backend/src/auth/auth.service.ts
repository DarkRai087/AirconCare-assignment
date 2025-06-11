import { Injectable } from '@nestjs/common';
     import { PrismaService } from '../../prisma/prisma.service';
     import * as bcrypt from 'bcrypt';
     import { JwtService } from '@nestjs/jwt';

     @Injectable()
     export class AuthService {
       constructor(
         private prisma: PrismaService,
         private jwtService: JwtService
       ) {}

       async register(email: string, password: string, role: 'ADMIN' | 'CLIENT') {
         const hashedPassword = await bcrypt.hash(password, 10);
         const user = await this.prisma.user.create({
           data: { email, password: hashedPassword, role },
         });
         return user;
       }

       async login(email: string, password: string) {
         const user = await this.prisma.user.findUnique({ where: { email } });
         if (!user || !(await bcrypt.compare(password, user.password))) {
           throw new Error('Invalid credentials');
         }
         const payload = { email: user.email, sub: user.id, role: user.role };
         return { access_token: this.jwtService.sign(payload) };
       }
     }