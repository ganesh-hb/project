import { Repository } from 'typeorm';
import { UserCompanyGroupEntity } from 'src/packages/entity/user.company.group.entity';
import { ForbiddenException } from '@nestjs/common';

export interface AuthContext {
    isSuperAdmin: boolean;
    activeCompanyId: number;
    activeGroupId: number;
    activeGroupName: string | null;
}

export async function resolveAuthContext(
    req: any,
    ucgRepo: Repository<UserCompanyGroupEntity>
): Promise<AuthContext> {
    if (req && req.activeProfileResolved) {
        return {
            isSuperAdmin: req.isSuperAdmin,
            activeCompanyId: req.activeCompanyId,
            activeGroupId: req.activeGroupId,
            activeGroupName: req.activeGroupName,
        };
    }

    const userId = req?.user?.userId;
    if (!userId) {
        throw new ForbiddenException('Not authenticated');
    }

    const ucg =
        await ucgRepo.findOne({
            where: { userId, is_parent: 0 },
            relations: ['group'],
        }) ??
        await ucgRepo.findOne({
            where: { userId },
            relations: ['group'],
        });

    if (!ucg) {
        throw new ForbiddenException('No profile assigned');
    }

    const context = {
        isSuperAdmin: ucg.group?.groupName === 'superAdmin',
        activeCompanyId: ucg.companyId,
        activeGroupId: ucg.groupId,
        activeGroupName: ucg.group?.groupName || null,
    };

    if (req) {
        req.isSuperAdmin = context.isSuperAdmin;
        req.activeCompanyId = context.activeCompanyId;
        req.activeGroupId = context.activeGroupId;
        req.activeGroupName = context.activeGroupName;
        req.scopedCompanyIds = context.isSuperAdmin ? [] : [ucg.companyId];
        req.userRoles = [ucg.group?.groupName].filter(Boolean);
        req.activeProfileResolved = true;
    }

    return context;
}
