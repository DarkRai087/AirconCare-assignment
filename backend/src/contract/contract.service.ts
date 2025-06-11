import { Injectable, ForbiddenException } from '@nestjs/common';
      import { PrismaService } from '../../prisma/prisma.service';
      import { Contract, FSMStatus } from '@prisma/client';

      @Injectable()
      export class ContractService {
        private readonly transitions: Record<FSMStatus, FSMStatus[]> = {
          [FSMStatus.QUOTE_REQUESTED]: [FSMStatus.QUOTE_SENT],
          [FSMStatus.QUOTE_SENT]: [FSMStatus.ACCEPTED_BY_CLIENT, FSMStatus.QUOTE_REQUESTED],
          [FSMStatus.ACCEPTED_BY_CLIENT]: [FSMStatus.PAYMENT_COMPLETED],
          [FSMStatus.PAYMENT_COMPLETED]: [FSMStatus.SERVICE_SCHEDULED],
          [FSMStatus.SERVICE_SCHEDULED]: [FSMStatus.IN_PROGRESS],
          [FSMStatus.IN_PROGRESS]: [FSMStatus.COMPLETED],
          [FSMStatus.COMPLETED]: [],
        };

        private readonly transitionRoles: Record<string, string> = {
          [`${FSMStatus.QUOTE_REQUESTED}->${FSMStatus.QUOTE_SENT}`]: 'ADMIN',
          [`${FSMStatus.QUOTE_SENT}->${FSMStatus.ACCEPTED_BY_CLIENT}`]: 'CLIENT',
          [`${FSMStatus.QUOTE_SENT}->${FSMStatus.QUOTE_REQUESTED}`]: 'ADMIN',
          [`${FSMStatus.ACCEPTED_BY_CLIENT}->${FSMStatus.PAYMENT_COMPLETED}`]: 'CLIENT',
          [`${FSMStatus.PAYMENT_COMPLETED}->${FSMStatus.SERVICE_SCHEDULED}`]: 'ADMIN',
          [`${FSMStatus.SERVICE_SCHEDULED}->${FSMStatus.IN_PROGRESS}`]: 'ADMIN',
          [`${FSMStatus.IN_PROGRESS}->${FSMStatus.COMPLETED}`]: 'ADMIN',
        };

        constructor(private prisma: PrismaService) {}

        async createContract(data: {
          clientId: string;
          acType: string;
          unitCount: number;
          address: string;
          preferredDate: Date;
        }): Promise<Contract> {
          return this.prisma.contract.create({
            data: {
              ...data,
              status: FSMStatus.QUOTE_REQUESTED,
              quoteAmount: 0,
              notes: [],
            },
          });
        }

        // In updateStatus, clarify allowed client actions for FSM
        async updateStatus(id: string, newStatus: FSMStatus, userId: string, userRole: string, additionalData?: any): Promise<Contract> {
          const contract = await this.prisma.contract.findUnique({ where: { id } });
          if (!contract) throw new Error('Contract not found');

          const currentStatus = contract.status;
          const transitionKey = `${currentStatus}->${newStatus}`;
          const requiredRole = this.transitionRoles[transitionKey];

          // Allow client to perform ACCEPTED_BY_CLIENT and PAYMENT_COMPLETED for their own contract, but only in correct order
          if (
            ((newStatus === FSMStatus.ACCEPTED_BY_CLIENT && currentStatus === FSMStatus.QUOTE_SENT) ||
             (newStatus === FSMStatus.PAYMENT_COMPLETED && currentStatus === FSMStatus.ACCEPTED_BY_CLIENT)) &&
            userRole === 'CLIENT' && contract.clientId === userId
          ) {
            // allowed
          } else if (!requiredRole || (requiredRole === 'CLIENT' && (userRole !== 'CLIENT' || contract.clientId !== userId)) || (requiredRole === 'ADMIN' && userRole !== 'ADMIN')) {
            throw new ForbiddenException('Not allowed to perform this transition');
          }

          if (!this.transitions[currentStatus].includes(newStatus)) {
            throw new ForbiddenException('Invalid status transition');
          }

          let updateData: any = { status: newStatus };
          if (newStatus === FSMStatus.QUOTE_SENT) {
            if (!additionalData?.quoteAmount) throw new Error('quoteAmount is required');
            updateData.quoteAmount = additionalData.quoteAmount;
          } else if (newStatus === FSMStatus.SERVICE_SCHEDULED) {
            if (!additionalData?.serviceDate) throw new Error('serviceDate is required');
            updateData.serviceDate = additionalData.serviceDate;
          }

          return this.prisma.contract.update({ where: { id }, data: updateData });
        }

        async getContracts(userId: string, userRole: string): Promise<Contract[]> {
          return userRole === 'ADMIN' ? this.prisma.contract.findMany() : this.prisma.contract.findMany({ where: { clientId: userId } });
        }

        async getContract(id: string, userId: string, userRole: string): Promise<Contract> {
          const contract = await this.prisma.contract.findUnique({ where: { id } });
          if (!contract) throw new Error('Contract not found');
          if (userRole === 'CLIENT' && contract.clientId !== userId) throw new ForbiddenException('Not allowed to access this contract');
          return contract;
        }
      }