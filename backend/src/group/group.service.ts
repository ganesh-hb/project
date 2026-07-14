import { Inject, Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { ActivityCode } from '../activity/enums/activity-code.enum';

import { GroupEntity } from 'src/packages/entity/group.entity';
import { FileTransfer } from 'src/utilities/file.transfer';
import { Filter } from 'src/utilities/filter';
import { Mailer } from 'src/utilities/mailer';
import { UserCompanyGroupEntity } from 'src/packages/entity/user.company.group.entity';
import { PermissionEntity, GroupPermissionEntity } from 'src/packages/entity/capability.entity';
import { UserEntity } from 'src/packages/entity/user.entity';
import { resolveAuthContext } from 'src/utilities/auth-helper';

@Injectable()
export class GroupService {
    constructor(private readonly fileTransfer: FileTransfer, private readonly eventEmitter: EventEmitter2) {}

    @Inject()
    private readonly filter?: Filter;

    @Inject()
    private readonly mailer?: Mailer;

    @InjectRepository(GroupEntity)
    protected groupEntity!: Repository<GroupEntity>;

    @InjectRepository(UserCompanyGroupEntity)
    protected ucgEntity!: Repository<UserCompanyGroupEntity>;

    @InjectRepository(PermissionEntity)
    protected permissionEntity!: Repository<PermissionEntity>;

    @InjectRepository(GroupPermissionEntity)
    protected groupPermissionEntity!: Repository<GroupPermissionEntity>;

    async startInsertGroup(params: any, req?: any) {
        const res = await this.insertGroup(params, req);
        if (res.success === 1) return this.finishSuccess(res, params);
        return this.finishFailure(res);
    }

    async insertGroup(params: any, req?: any) {
        const queryParams: any = {};
        try {
            if (params.groupName) queryParams.groupName = params.groupName;
            if (params.groupCode) queryParams.groupCode = params.groupCode;
            if (params.status)    queryParams.status    = params.status;
            if (params.addedBy)   queryParams.addedBy   = Number(params.addedBy);

            const result = await this.groupEntity!.insert(queryParams);
            const insertId = result?.raw?.insertId;
            return { success: 1, message: 'Inserted successfully', data: { insertData: insertId } };
        } catch (err: any) {
            return { success: 0, message: err?.message };
        }
    }

    async finishSuccess(res: any, params: any) {
        return { settings: { id: res?.data?.insertData, success: res?.success, message: res?.message, data: params } };
    }

    async finishFailure(res: any) { return res; }

    async startUpdate(params: any, req?: any) {
        const authCtx = await resolveAuthContext(req, this.ucgEntity);
        if (!authCtx.isSuperAdmin) {
            const group = await this.groupEntity.findOne({ where: { groupId: params.groupId } });
            if (!group) throw new NotFoundException('Group not found');
            if (group.addedBy === null) {
                throw new ForbiddenException('Access denied: cannot modify system groups');
            }
            const creatorUcg = await this.ucgEntity.findOne({
                where: { userId: group.addedBy, companyId: authCtx.activeCompanyId }
            });
            if (!creatorUcg) {
                throw new ForbiddenException('Access denied: group belongs to another company');
            }
        }

        const res = await this.updateGroup(params, req);
        if (res.success === 1) return this.updateSuccess(res, params);
        return this.finishFailure(res);
    }

    async updateGroup(params: any, req?: any) {
        const queryParams: any = {};
        if (!params.groupId) return { success: 0, message: 'groupId is mandatory' };
        try {
            const authCtx = await resolveAuthContext(req, this.ucgEntity);
            if (!authCtx.isSuperAdmin) {
                const group = await this.groupEntity.findOne({ where: { groupId: params.groupId } });
                if (!group) throw new NotFoundException('Group not found');
                if (group.addedBy === null) {
                    throw new ForbiddenException('Access denied: cannot modify system groups');
                }
                const creatorUcg = await this.ucgEntity.findOne({
                    where: { userId: group.addedBy, companyId: authCtx.activeCompanyId }
                });
                if (!creatorUcg) {
                    throw new ForbiddenException('Access denied: group belongs to another company');
                }
            }

            if (params.groupName) queryParams.groupName = params.groupName;
            if (params.groupCode) queryParams.groupCode = params.groupCode;
            if (params.status)    queryParams.status    = params.status;
            if (params.updatedBy) queryParams.updatedBy = Number(params.updatedBy);
            queryParams.updatedDate = () => 'NOW()';

            const result = await this.groupEntity!.update({ groupId: params.groupId }, queryParams);
            return { success: 1, message: 'Updated successfully', data: { affected: result.affected } };
        } catch (err: any) {
            return { success: 0, message: err?.message };
        }
    }

    async updateSuccess(result: any, params: any) { return { status: result, data: params }; }

    async getGroups(param: any, req?: any) {
        let return_data: any = {};
        try {
            const authCtx = await resolveAuthContext(req, this.ucgEntity);
            const queryBuilder = this.groupEntity?.createQueryBuilder('group');
            const queryString = await this.filter!.makeFilterString(param?.filters, 'group');
            if (queryString && queryString !== '') queryBuilder!.andWhere(queryString);

            const [skip, limit] = (await this.filter?.calcPages(param, this.groupEntity)) as [number, number];
            queryBuilder!.skip(skip).take(limit);
            queryBuilder!.andWhere('group.groupName != :name', { name: 'superAdmin' });

            if (!authCtx.isSuperAdmin) {
                queryBuilder.leftJoin(
                    UserCompanyGroupEntity,
                    'creator_ucg',
                    'creator_ucg.userId = group.addedBy'
                );
                queryBuilder.andWhere(
                    '(group.addedBy IS NULL OR creator_ucg.companyId = :activeCompanyId)',
                    { activeCompanyId: authCtx.activeCompanyId }
                );
            }

            const [data, total] = await queryBuilder!.getManyAndCount();

            return_data = { success: 1, message: 'List fetched successfully', total, data };
        } catch (err: any) {
            return_data = { success: 0, message: err.message };
        }
        return return_data;
    }

    async getGroup(query: any, req?: any) {
        try {
            const authCtx = await resolveAuthContext(req, this.ucgEntity);
            const groupId = Number(query);

            const group = await this.groupEntity!.findOne({ where: { groupId } });
            if (!group) throw new NotFoundException('Group not found');

            if (!authCtx.isSuperAdmin && group.addedBy !== null) {
                const creatorUcg = await this.ucgEntity.findOne({
                    where: { userId: group.addedBy, companyId: authCtx.activeCompanyId }
                });
                if (!creatorUcg) {
                    throw new ForbiddenException('Access denied: group belongs to another company');
                }
            }

            const userRepo = this.groupEntity!.manager.getRepository(UserEntity);
            const [assignments, addedByUser, updatedByUser] = await Promise.all([
                this.ucgEntity!.find({
                    where: { groupId, ...(authCtx.isSuperAdmin ? {} : { companyId: authCtx.activeCompanyId }) },
                    relations: ['user', 'company'],
                }),
                group.addedBy ? userRepo.findOne({ where: { userId: group.addedBy }, select: ['name'] }) : null,
                group.updatedBy ? userRepo.findOne({ where: { userId: group.updatedBy }, select: ['name'] }) : null,
            ]);

            return {
                ...group,
                addedByName: addedByUser?.name ?? null,
                updatedByName: updatedByUser?.name ?? null,
                assignments: assignments.map((ucg) => ({
                    userId: ucg.userId,
                    userName: ucg.user?.name,
                    userEmail: ucg.user?.email,
                    companyId: ucg.companyId,
                    companyName: ucg.company?.companyName,
                    is_parent: ucg.is_parent,
                })),
            };
        } catch (err) {
            return err;
        }
    }


    async getAllPermissions() {
        try {
            const permissions = await this.permissionEntity!.find();
            return { success: 1, data: permissions };
        } catch (err: any) {
            return { success: 0, message: err.message };
        }
    }

    async getGroupPermissions(groupId: number) {
        try {
            const groupPerms = await this.groupPermissionEntity!.find({
                where: { groupId },
                relations: ['permission'],
            });
            const permissions = groupPerms.map((gp) => gp.permission?.permissionName).filter(Boolean);
            return { success: 1, groupId, permissions };
        } catch (err: any) {
            return { success: 0, message: err.message };
        }
    }

   async saveGroupPermissions(groupId: number, permissionNames: string[]) {
    try {

        const allPermissions = await this.permissionEntity!.find();
        const nameToId = Object.fromEntries(
            allPermissions.map((p) => [p.permissionName, p.permissionId])
        );

        const requestedIds = new Set(
            permissionNames.map((name) => nameToId[name]).filter(Boolean)
        );

        const existing = await this.groupPermissionEntity!.find({ where: { groupId } });
        const existingIds = new Set(existing.map((e) => e.permissionId));

        const toDelete = existing.filter((e) => !requestedIds.has(e.permissionId));
        if (toDelete.length > 0) {
            await this.groupPermissionEntity!.remove(toDelete);
        }

        const toInsert = [...requestedIds]
            .filter((id) => !existingIds.has(id))
            .map((permissionId) =>
                this.groupPermissionEntity!.create({ groupId, permissionId })
            );
        if (toInsert.length > 0) {
            await this.groupPermissionEntity!.save(toInsert);
        }

        return { success: 1, message: 'Permissions saved successfully', count: requestedIds.size };
    } catch (err: any) {
        return { success: 0, message: err.message };
    }
}
    
}