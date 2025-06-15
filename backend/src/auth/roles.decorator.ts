import { SetMetadata } from '@nestjs/common';
//Checks if the authenticated user has the required role for a route.
     export const Roles = (...roles: string[]) => SetMetadata('roles', roles);