import { PrismaService } from '../../prisma/prisma.service';
import { Contract, FSMStatus } from '@prisma/client';
export declare class ContractService {
    private prisma;
    private readonly transitions;
    private readonly transitionRoles;
    constructor(prisma: PrismaService);
    createContract(data: {
        clientId: string;
        acType: string;
        unitCount: number;
        address: string;
        preferredDate: Date;
    }): Promise<Contract>;
    updateStatus(id: string, newStatus: FSMStatus, userId: string, userRole: string, additionalData?: any): Promise<Contract>;
    getContracts(userId: string, userRole: string): Promise<Contract[]>;
    getContract(id: string, userId: string, userRole: string): Promise<Contract>;
}
