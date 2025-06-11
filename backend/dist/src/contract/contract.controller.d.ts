import { ContractService } from './contract.service';
import { FSMStatus } from '@prisma/client';
export declare class ContractController {
    private contractService;
    constructor(contractService: ContractService);
    createContract(data: any, req: any): Promise<{
        id: string;
        clientId: string;
        status: import(".prisma/client").$Enums.FSMStatus;
        acType: string;
        unitCount: number;
        address: string;
        preferredDate: Date;
        serviceDate: Date | null;
        quoteAmount: number;
        notes: import("@prisma/client/runtime/library").JsonValue;
    }>;
    updateStatus(id: string, status: FSMStatus, additionalData: any, req: any): Promise<{
        id: string;
        clientId: string;
        status: import(".prisma/client").$Enums.FSMStatus;
        acType: string;
        unitCount: number;
        address: string;
        preferredDate: Date;
        serviceDate: Date | null;
        quoteAmount: number;
        notes: import("@prisma/client/runtime/library").JsonValue;
    }>;
    getContracts(req: any): Promise<{
        id: string;
        clientId: string;
        status: import(".prisma/client").$Enums.FSMStatus;
        acType: string;
        unitCount: number;
        address: string;
        preferredDate: Date;
        serviceDate: Date | null;
        quoteAmount: number;
        notes: import("@prisma/client/runtime/library").JsonValue;
    }[]>;
    getContract(id: string, req: any): Promise<{
        id: string;
        clientId: string;
        status: import(".prisma/client").$Enums.FSMStatus;
        acType: string;
        unitCount: number;
        address: string;
        preferredDate: Date;
        serviceDate: Date | null;
        quoteAmount: number;
        notes: import("@prisma/client/runtime/library").JsonValue;
    }>;
}
