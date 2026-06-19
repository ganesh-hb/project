import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { CompanyEntity } from 'src/packages/entity/company.entity';
import { FileTransfer } from 'src/utilities/file.transfer';
import { Filter } from 'src/utilities/filter';
import { Mailer } from 'src/utilities/mailer';
import { UserCompanyGroupEntity } from 'src/packages/entity/user.company.group.entity';

@Injectable()
export class CompanyService {
    constructor(private readonly fileTransfer: FileTransfer) {}

    @Inject()
    private readonly filter!: Filter;

    @Inject()
    private readonly mailer!: Mailer;

    @InjectRepository(CompanyEntity)
    protected companyEntity!: Repository<CompanyEntity>;

    @InjectRepository(UserCompanyGroupEntity)
    protected ucgEntity!: Repository<UserCompanyGroupEntity>;

   async startInsertCompany(params: any, companyFile: any) {
        const res = await this.insertCompany(params, companyFile);
        if (res.success === 1) {
            return this.finishSuccess(res, params, companyFile);
        }
        return this.finishFailure(res);
    }

async insertCompany(params: any, companyFile: any) {
    const queryParams: any = {};
    try {
        if (params.companyName)     queryParams.companyName     = params.companyName;
        if (params.companyCode)     queryParams.companyCode     = params.companyCode;
        if (params.companyLocation) queryParams.companyLocation = params.companyLocation;
        if (params.status)          queryParams.status          = params.status;
        if (params.email)           queryParams.email           = params.email;
        if (params.website)         queryParams.website         = params.website;
        if (params.dialCode)        queryParams.dialCode        = Number(params.dialCode);
        if (params.phone)           queryParams.phone           = Number(params.phone);
        if (params.country)         queryParams.country         = params.country;
        if (params.state)           queryParams.state           = params.state;
        if (params.postalCode)      queryParams.postalCode      = Number(params.postalCode);
        if (params.AddressLineOne)  queryParams.AddressLineOne  = params.AddressLineOne;
        if (params.ownerName)       queryParams.ownerName       = params.ownerName;
        if (params.ownerEmail)      queryParams.ownerEmail      = params.ownerEmail;
        if (params.ownerPhone)      queryParams.ownerPhone      = params.ownerPhone;
        if (companyFile)            queryParams.companyFile     = companyFile.filename;

        const result = await this.companyEntity.insert(queryParams);
        return { success: 1, message: 'Inserted successfully', data: { insertData: result?.raw?.insertId } };
    } catch (err: any) {
        return { success: 0, message: err?.message };
    }
}

    async finishSuccess(res: any, params: any, companyFile: any) {
        const output: any = {
            settings: {
                id: res?.data?.insertData,
                success: res?.success,
                message: res?.message,
                data: params,
            },
        };

        const fid: number = parseInt(output.settings.id);
        await this.fileTransfer.fileTransfer3(companyFile.filename, fid, fid);
        return output;
    }

    async finishFailure(res: any) {
        return res;
    }

   async startUpdate(params: any, companyFile: any) {
        const res = await this.updateCompany(params, companyFile);
        if (res.success === 1) {
            return this.updateSuccess(res, params);
        }
        return this.finishFailure(res);
    }

  async updateCompany(params: any, companyFile: any) {
    const queryParams: any = {};

    if (!params.companyId) return { success: 0, message: 'companyId is mandatory' };

    try {
        if (params.companyName)     queryParams.companyName     = params.companyName;
        if (params.companyCode)     queryParams.companyCode     = params.companyCode;
        if (params.companyLocation) queryParams.companyLocation = params.companyLocation;
        if (params.status)          queryParams.status          = params.status;
        if (params.email)           queryParams.email           = params.email;
        if (params.website)         queryParams.website         = params.website;
        if (params.dialCode)        queryParams.dialCode        = Number(params.dialCode);
        if (params.phone)           queryParams.phone           = Number(params.phone);
        if (params.country)         queryParams.country         = params.country;
        if (params.state)           queryParams.state           = params.state;
        if (params.postalCode)      queryParams.postalCode      = Number(params.postalCode);
        if (params.AddressLineOne)  queryParams.AddressLineOne  = params.AddressLineOne;
        if (params.ownerName)       queryParams.ownerName       = params.ownerName;
        if (params.ownerEmail)      queryParams.ownerEmail      = params.ownerEmail;
        if (params.ownerPhone)      queryParams.ownerPhone      = params.ownerPhone;
        if (companyFile)            queryParams.companyFile     = companyFile.filename;

        queryParams.updatedDate = () => 'NOW()';

        const result = await this.companyEntity.update({ companyId: params.companyId }, queryParams);

        if (companyFile) {
            await this.fileTransfer.fileTransfer3(companyFile.filename, params.companyId, params.companyId);
        }

        return { success: 1, message: 'Updated successfully', data: { affected: result.affected } };
    } catch (err: any) {
        return { success: 0, message: err?.message };
    }
}
    async updateSuccess(result: any, params: any) {
        return { status: result, data: params };
    }

   async getCompanys(param: any) {
        let return_data: any = {};
        try {
            const queryBuilder = this.companyEntity.createQueryBuilder('company');
            const alias = 'company';

            const queryString = await this.filter.makeFilterString(
                param?.filters,
                alias,
            );

            if (queryString && queryString !== '') {
                queryBuilder.andWhere(queryString);
            }

            const [skip, limit] = (await this.filter.calcPages(
                param,
                this.companyEntity,
            )) as [number, number];

            queryBuilder.skip(skip).take(limit);
            const [data, total] = await queryBuilder.getManyAndCount();

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


 async getCompany(query: any) {
        try {
            const company = await this.companyEntity.findOne({
                where: { companyId: Number(query) },
            });

            if (!company) {
                throw new NotFoundException('Company not found');
            }

            // Fetch all mapping rows for this company, joining user and group
            const assignments = await this.ucgEntity.find({
                where: { companyId: Number(query) },
                relations: ['user', 'group'],
            });

            return {
                ...company,
                assignments: assignments.map((ucg) => ({
                    userId: ucg.userId,
                    userName: ucg.user?.name,
                    userEmail: ucg.user?.email,
                    groupId: ucg.groupId,
                    groupName: ucg.group?.groupName,
                    is_parent: ucg.is_parent,
                })),
            };
        } catch (err) {
            return err;
        }
    }



}
