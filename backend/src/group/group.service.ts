import { Inject, Injectable, NotFoundException } from '@nestjs/common';
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

@Injectable()
export class GroupService {
    constructor(private readonly fileTransfer: FileTransfer, private readonly eventEmitter: EventEmitter2) {}

    @Inject()
    private readonly filter?: Filter;

    @Inject()
    private readonly mailer?: Mailer;

    @InjectRepository(GroupEntity)
    protected groupEntity?: Repository<GroupEntity>;

    @InjectRepository(UserCompanyGroupEntity)
    protected ucgEntity?: Repository<UserCompanyGroupEntity>;

    @InjectRepository(PermissionEntity)
    protected permissionEntity?: Repository<PermissionEntity>;

    @InjectRepository(GroupPermissionEntity)
    protected groupPermissionEntity?: Repository<GroupPermissionEntity>;

    async startInsertGroup(params: any) {
        const res = await this.insertGroup(params);
        if (res.success === 1) return this.finishSuccess(res, params);
        return this.finishFailure(res);
    }

    async insertGroup(params: any) {
        const queryParams: any = {};
        try {
            if (params.groupName) queryParams.groupName = params.groupName;
            if (params.groupCode) queryParams.groupCode = params.groupCode;
            if (params.status)    queryParams.status    = params.status;

            const result = await this.groupEntity!.insert(queryParams);
            const insertId = result?.raw?.insertId;
            // Emit activity after successful group creation
            // this.eventEmitter.emit('activity.log', {
            //   activityCode: ActivityCode.GROUP_CREATE,
            //   userId: null,
            //   companyId: null,
            //   actorType: 'USER',
            //   executionStatus: 'SUCCESS',
            //   severity: 'INFO',
            //   parameters: { groupName: params.groupName },
            //   metadata: {},
            // });
            return { success: 1, message: 'Inserted successfully', data: { insertData: insertId } };
        } catch (err: any) {
            return { success: 0, message: err?.message };
        }
    }

    async finishSuccess(res: any, params: any) {
        return { settings: { id: res?.data?.insertData, success: res?.success, message: res?.message, data: params } };
    }

    async finishFailure(res: any) { return res; }

    async startUpdate(params: any) {
        const res = await this.updateGroup(params);
        if (res.success === 1) return this.updateSuccess(res, params);
        return this.finishFailure(res);
    }

    async updateGroup(params: any) {
        const queryParams: any = {};
        if (!params.groupId) return { success: 0, message: 'groupId is mandatory' };
        try {
            if (params.groupName) queryParams.groupName = params.groupName;
            if (params.groupCode) queryParams.groupCode = params.groupCode;
            if (params.status)    queryParams.status    = params.status;
            queryParams.updatedDate = () => 'NOW()';

            const result = await this.groupEntity!.update({ groupId: params.groupId }, queryParams);
            // Emit activity after successful group update
            // this.eventEmitter.emit('activity.log', {
            //   activityCode: ActivityCode.GROUP_UPDATE,
            //   userId: params.updatedBy ?? null,
            //   companyId: null,
            //   actorType: 'USER',
            //   executionStatus: 'SUCCESS',
            //   severity: 'INFO',
            //   parameters: { updatedFields: Object.keys(params) },
            //   metadata: {},
            // });
            return { success: 1, message: 'Updated successfully', data: { affected: result.affected } };
        } catch (err: any) {
            return { success: 0, message: err?.message };
        }
    }

    async updateSuccess(result: any, params: any) { return { status: result, data: params }; }

    async getGroups(param: any) {
        let return_data: any = {};
        try {
            const queryBuilder = this.groupEntity?.createQueryBuilder('group');
            const queryString = await this.filter!.makeFilterString(param?.filters, 'group');
            if (queryString && queryString !== '') queryBuilder!.andWhere(queryString);

            const [skip, limit] = (await this.filter?.calcPages(param, this.groupEntity)) as [number, number];
            queryBuilder!.skip(skip).take(limit);
            queryBuilder!.andWhere('group.groupName != :name', { name: 'superAdmin' });
            const [data, total] = await queryBuilder!.getManyAndCount();

            return_data = { success: 1, message: 'List fetched successfully', total, data };
        } catch (err: any) {
            return_data = { success: 0, message: err.message };
        }
        return return_data;
    }

    async getGroup(query: any) {
        try {
            const groupId = Number(query);

            const [group, assignments] = await Promise.all([
                this.groupEntity!.findOne({ where: { groupId } }),
                this.ucgEntity!.find({
                    where: { groupId },
                    relations: ['user', 'company'],
                }),
            ]);

            if (!group) throw new NotFoundException('Group not found');

            return {
                ...group,
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