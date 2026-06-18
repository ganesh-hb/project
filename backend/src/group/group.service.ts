import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { GroupEntity } from 'src/packages/entity/group.entity';
import { FileTransfer } from 'src/utilities/file.transfer';
import { Filter } from 'src/utilities/filter';
import { Mailer } from 'src/utilities/mailer';
import { UserCompanyGroupEntity } from 'src/packages/entity/user.company.group.entity';

@Injectable()
export class GroupService {
    constructor(private readonly fileTransfer: FileTransfer) {}

    @Inject()
    private readonly filter?: Filter;

    @Inject()
    private readonly mailer?: Mailer;

    @InjectRepository(GroupEntity)
    protected groupEntity?: Repository<GroupEntity>;

    @InjectRepository(UserCompanyGroupEntity)
    protected ucgEntity?: Repository<UserCompanyGroupEntity>;


    async startInsertGroup(params: any, groupFile: any) {
        const res = await this.insertGroup(params, groupFile);
        if (res.success === 1) {
            return this.finishSuccess(res, params, groupFile);
        }
        return this.finishFailure(res);
    }

    async insertGroup(params: any, groupFile: any) {
        const queryParams: any = {};
        let resultData: any = {};

        try {
            if (params.groupName)  queryParams.groupName  = params.groupName;
            if (params.groupCode)  queryParams.groupCode  = params.groupCode;
            if (params.status)     queryParams.status     = params.status;
            if (groupFile)         queryParams.groupFile  = groupFile.filename;

            const result = await this.groupEntity!.insert(queryParams);
            const insertData = result?.raw?.insertId;

            resultData = {
                success: 1,
                message: 'Inserted successfully',
                data: { insertData },
            };
        } catch (err: any) {
            resultData = { success: 0, message: err?.message };
        }

        return resultData;
    }

    async finishSuccess(res: any, params: any, groupFile: any) {
        const output: any = {
            settings: {
                id: res?.data?.insertData,
                success: res?.success,
                message: res?.message,
                data: params,
            },
        };

        const fid: number = parseInt(output.settings.id);
        await this.fileTransfer.fileTransfer2(groupFile.filename, fid, fid);
        return output;
    }

    async finishFailure(res: any) {
        return res;
    }


    async startUpdate(params: any, groupFile: any) {
        const res = await this.updateGroup(params, groupFile);
        if (res.success === 1) {
            return this.updateSuccess(res, params);
        }
        return this.finishFailure(res);
    }

    async updateGroup(params: any, groupFile: any) {
        const queryParams: any = {};

        if (!params.groupId) {
            return { success: 0, message: 'groupId is mandatory' };
        }

        try {
            if (params.groupName) queryParams.groupName = params.groupName;
            if (params.groupCode) queryParams.groupCode = params.groupCode;
            if (params.status)    queryParams.status    = params.status;
            if (groupFile)        queryParams.groupFile = groupFile.filename;

            queryParams.updatedDate = () => 'NOW()';

            const result = await this.groupEntity!.update(
                { groupId: params.groupId },
                queryParams,
            );

            if (groupFile) {
                await this.fileTransfer.fileTransfer2(
                    groupFile.filename,
                    params.groupId,
                    params.groupId,
                );
            }

            return {
                success: 1,
                message: 'Updated successfully',
                data: { affected: result.affected },
            };
        } catch (err: any) {
            return { success: 0, message: err?.message };
        }
    }

    async updateSuccess(result: any, params: any) {
        return { status: result, data: params };
    }

async getGroups(param: any) {
        let return_data: any = {};
        try {
            const queryBuilder = this.groupEntity?.createQueryBuilder('group');
            const alias = 'group';

            const queryString = await this.filter!.makeFilterString(
                param?.filters,
                alias,
            );

            if (queryString && queryString !== '') {
                queryBuilder!.andWhere(queryString);
            }

            const [skip, limit] = (await this.filter?.calcPages(
                param,
                this.groupEntity,
            )) as [number, number];

            queryBuilder!.skip(skip).take(limit);
            const [data, total] = await queryBuilder!.getManyAndCount();

            return_data = {
                success: 1,
                message: 'List fetched successfully',
                total,
                data,
            };
        } catch (err: any) {
            return_data = { success: 0, message: err.message };
        }

        return return_data;
    }


    async getGroup(query: any) {
        try {
            const group = await this.groupEntity!.findOne({
                where: { groupId: Number(query) },
            });

            if (!group) {
                throw new NotFoundException('Group not found');
            }

            // Fetch all mapping rows for this group, joining user and company
            const assignments = await this.ucgEntity!.find({
                where: { groupId: Number(query) },
                relations: ['user', 'company'],
            });

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



}
