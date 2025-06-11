import { Controller, Get, Post, Patch, Param, Body, UseGuards, Req } from '@nestjs/common';
      import { ContractService } from './contract.service';
      import { AuthGuard } from '@nestjs/passport';
      import { RolesGuard } from '../auth/roles.guard';
      import { Roles } from '../auth/roles.decorator';
      import { FSMStatus } from '@prisma/client';

      @Controller('contracts')
      @UseGuards(AuthGuard('jwt'), RolesGuard)
      export class ContractController {
        constructor(private contractService: ContractService) {}

        @Post()
        @Roles('CLIENT')
        async createContract(@Body() data, @Req() req) {
          console.log('DEBUG createContract req.user:', req.user); // Debug log
          const clientId = req.user.userId;
          return this.contractService.createContract({ ...data, clientId });
        }

        @Patch(':id')
        async updateStatus(
          @Param('id') id: string,
          @Body('status') status: FSMStatus,
          @Body() additionalData,
          @Req() req
        ) {
          const userId = req.user.userId;
          const userRole = req.user.role;
          return this.contractService.updateStatus(id, status, userId, userRole, additionalData);
        }

        @Get()
        async getContracts(@Req() req) {
          const userId = req.user.userId;
          const userRole = req.user.role;
          return this.contractService.getContracts(userId, userRole);
        }

        @Get(':id')
        async getContract(@Param('id') id: string, @Req() req) {
          const userId = req.user.userId;
          const userRole = req.user.role;
          return this.contractService.getContract(id, userId, userRole);
        }
      }