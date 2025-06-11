"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ContractService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const client_1 = require("@prisma/client");
let ContractService = class ContractService {
    prisma;
    transitions = {
        [client_1.FSMStatus.QUOTE_REQUESTED]: [client_1.FSMStatus.QUOTE_SENT],
        [client_1.FSMStatus.QUOTE_SENT]: [client_1.FSMStatus.ACCEPTED_BY_CLIENT, client_1.FSMStatus.QUOTE_REQUESTED],
        [client_1.FSMStatus.ACCEPTED_BY_CLIENT]: [client_1.FSMStatus.PAYMENT_COMPLETED],
        [client_1.FSMStatus.PAYMENT_COMPLETED]: [client_1.FSMStatus.SERVICE_SCHEDULED],
        [client_1.FSMStatus.SERVICE_SCHEDULED]: [client_1.FSMStatus.IN_PROGRESS],
        [client_1.FSMStatus.IN_PROGRESS]: [client_1.FSMStatus.COMPLETED],
        [client_1.FSMStatus.COMPLETED]: [],
    };
    transitionRoles = {
        [`${client_1.FSMStatus.QUOTE_REQUESTED}->${client_1.FSMStatus.QUOTE_SENT}`]: 'ADMIN',
        [`${client_1.FSMStatus.QUOTE_SENT}->${client_1.FSMStatus.ACCEPTED_BY_CLIENT}`]: 'CLIENT',
        [`${client_1.FSMStatus.QUOTE_SENT}->${client_1.FSMStatus.QUOTE_REQUESTED}`]: 'ADMIN',
        [`${client_1.FSMStatus.ACCEPTED_BY_CLIENT}->${client_1.FSMStatus.PAYMENT_COMPLETED}`]: 'CLIENT',
        [`${client_1.FSMStatus.PAYMENT_COMPLETED}->${client_1.FSMStatus.SERVICE_SCHEDULED}`]: 'ADMIN',
        [`${client_1.FSMStatus.SERVICE_SCHEDULED}->${client_1.FSMStatus.IN_PROGRESS}`]: 'ADMIN',
        [`${client_1.FSMStatus.IN_PROGRESS}->${client_1.FSMStatus.COMPLETED}`]: 'ADMIN',
    };
    constructor(prisma) {
        this.prisma = prisma;
    }
    async createContract(data) {
        return this.prisma.contract.create({
            data: {
                ...data,
                status: client_1.FSMStatus.QUOTE_REQUESTED,
                quoteAmount: 0,
                notes: [],
            },
        });
    }
    async updateStatus(id, newStatus, userId, userRole, additionalData) {
        const contract = await this.prisma.contract.findUnique({ where: { id } });
        if (!contract)
            throw new Error('Contract not found');
        const currentStatus = contract.status;
        const transitionKey = `${currentStatus}->${newStatus}`;
        const requiredRole = this.transitionRoles[transitionKey];
        if (((newStatus === client_1.FSMStatus.ACCEPTED_BY_CLIENT && currentStatus === client_1.FSMStatus.QUOTE_SENT) ||
            (newStatus === client_1.FSMStatus.PAYMENT_COMPLETED && currentStatus === client_1.FSMStatus.ACCEPTED_BY_CLIENT)) &&
            userRole === 'CLIENT' && contract.clientId === userId) {
        }
        else if (!requiredRole || (requiredRole === 'CLIENT' && (userRole !== 'CLIENT' || contract.clientId !== userId)) || (requiredRole === 'ADMIN' && userRole !== 'ADMIN')) {
            throw new common_1.ForbiddenException('Not allowed to perform this transition');
        }
        if (!this.transitions[currentStatus].includes(newStatus)) {
            throw new common_1.ForbiddenException('Invalid status transition');
        }
        let updateData = { status: newStatus };
        if (newStatus === client_1.FSMStatus.QUOTE_SENT) {
            if (!additionalData?.quoteAmount)
                throw new Error('quoteAmount is required');
            updateData.quoteAmount = additionalData.quoteAmount;
        }
        else if (newStatus === client_1.FSMStatus.SERVICE_SCHEDULED) {
            if (!additionalData?.serviceDate)
                throw new Error('serviceDate is required');
            updateData.serviceDate = additionalData.serviceDate;
        }
        return this.prisma.contract.update({ where: { id }, data: updateData });
    }
    async getContracts(userId, userRole) {
        return userRole === 'ADMIN' ? this.prisma.contract.findMany() : this.prisma.contract.findMany({ where: { clientId: userId } });
    }
    async getContract(id, userId, userRole) {
        const contract = await this.prisma.contract.findUnique({ where: { id } });
        if (!contract)
            throw new Error('Contract not found');
        if (userRole === 'CLIENT' && contract.clientId !== userId)
            throw new common_1.ForbiddenException('Not allowed to access this contract');
        return contract;
    }
};
exports.ContractService = ContractService;
exports.ContractService = ContractService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ContractService);
//# sourceMappingURL=contract.service.js.map