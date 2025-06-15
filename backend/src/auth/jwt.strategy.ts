import { Injectable } from '@nestjs/common';
     import { PassportStrategy } from '@nestjs/passport';
     import { ExtractJwt, Strategy } from 'passport-jwt';
//Passport strategy for validating JWT tokens
     @Injectable()
     export class JwtStrategy extends PassportStrategy(Strategy) {
       constructor() {
         super({
           jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
           ignoreExpiration: false,
           secretOrKey: 'secretKey', // Match with JwtModule
         });
       }

       async validate(payload: any) {
         return { userId: payload.sub, email: payload.email, role: payload.role };
       }
     }