import { Module } from '@nestjs/common';
      import { AuthModule } from './auth/auth.module';
      import { ContractModule } from './contract/contract.module';

      @Module({
        imports: [AuthModule, ContractModule],
      })
      export class AppModule {}