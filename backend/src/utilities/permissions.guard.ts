import { CanActivate, ExecutionContext, Injectable, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GroupPermissionEntity } from 'src/packages/entity/capability.entity';
import { UserCompanyGroupEntity } from 'src/packages/entity/user.company.group.entity';

export const PERMISSION_KEY = 'permission';
export const RequirePermission = (permission: string) =>
    (target: any, key: string, descriptor: PropertyDescriptor) => {
        Reflect.defineMetadata(PERMISSION_KEY, permission, descriptor.value);
        return descriptor;
    };

@Injectable()
export class PermissionsGuard implements CanActivate {
    constructor(
        private reflector: Reflector,
        @InjectRepository(UserCompanyGroupEntity)
        private ucgRepo: Repository<UserCompanyGroupEntity>,
        @InjectRepository(GroupPermissionEntity)
        private gpRepo: Repository<GroupPermissionEntity>,
    ) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const permission = this.reflector.get<string>(PERMISSION_KEY, context.getHandler());
        if (!permission) return true;

        const req = context.switchToHttp().getRequest();
        const userId = req.user?.userId;
        if (!userId) throw new ForbiddenException('Not authenticated');

        const ucg =
            await this.ucgRepo.findOne({ where: { userId, is_parent: 0 } }) ??
            await this.ucgRepo.findOne({ where: { userId } });

        if (!ucg) throw new ForbiddenException('No profile assigned');

        const perm = await this.gpRepo
            .createQueryBuilder('gp')
            .innerJoin('gp.permission', 'p')
            .where('gp.groupId = :groupId', { groupId: ucg.groupId })
            .andWhere('p.permissionName = :name', { name: permission })
            .getOne();

        if (!perm) throw new ForbiddenException(`Missing permission: ${permission}`);
        return true;
    }
}