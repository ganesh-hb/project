import {
    CanActivate,
    ExecutionContext,
    ForbiddenException,
    Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserCompanyGroupEntity } from 'src/packages/entity/user.company.group.entity';

export const ROLES_KEY = 'roles';
export const COMPANY_SCOPED = 'company_scoped';

@Injectable()
export class RolesGuard implements CanActivate {
    constructor(
        private reflector: Reflector,

        @InjectRepository(UserCompanyGroupEntity)
        private readonly ucgRepo: Repository<UserCompanyGroupEntity>,
    ) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const requiredRoles: string[] = this.reflector.get(ROLES_KEY, context.getHandler()) || [];
        const companyScoped: boolean = this.reflector.get(COMPANY_SCOPED, context.getHandler()) || false;

        // No role restriction on this route
        if (!requiredRoles.length && !companyScoped) return true;

        const request = context.switchToHttp().getRequest();
        const user = request.user; // set by JwtStrategy.validate()

        // Load this user's assignments with group info
        const assignments = await this.ucgRepo.find({
            where: { userId: user.userId },
            relations: ['group'],
        });

        const groupNames = assignments.map((a) => a.group?.groupName).filter(Boolean);
        const companyIds = assignments.map((a) => a.companyId);

        // Attach to request for use in controllers/services
        request.userRoles = groupNames;
        request.userCompanyIds = companyIds;
        request.isSuperAdmin = groupNames.includes('superAdmin');

        // Check required roles
        if (requiredRoles.length) {
            const hasRole = requiredRoles.some((r) => groupNames.includes(r));
            if (!hasRole) throw new ForbiddenException('Access denied');
        }

        // For company-scoped routes, attach company filter — actual filtering in service
        if (companyScoped && !request.isSuperAdmin) {
            request.scopedCompanyIds = companyIds;
        }

        return true;
    }
}