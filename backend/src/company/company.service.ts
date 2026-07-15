import { Inject, Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { ActivityCode } from '../activity/enums/activity-code.enum';

import { CompanyEntity } from 'src/packages/entity/company.entity';
import { FileTransfer } from 'src/utilities/file.transfer';
import { Filter } from 'src/utilities/filter';
import { Mailer } from 'src/utilities/mailer';
import { UserCompanyGroupEntity } from 'src/packages/entity/user.company.group.entity';
import { CurrencyEntity } from 'src/packages/entity/currency.entity';
import { CompanyCurrencyEntity } from 'src/packages/entity/company.currency.entity';
import { UserEntity } from 'src/packages/entity/user.entity';
import { resolveAuthContext } from 'src/utilities/auth-helper';

@Injectable()
export class CompanyService {
    constructor(private readonly fileTransfer: FileTransfer, private readonly eventEmitter: EventEmitter2) {}

    @Inject()
    private readonly filter!: Filter;

    @Inject()
    private readonly mailer!: Mailer;

    @InjectRepository(CompanyEntity)
    protected companyEntity!: Repository<CompanyEntity>;

    @InjectRepository(UserCompanyGroupEntity)
    protected ucgEntity!: Repository<UserCompanyGroupEntity>;

    @InjectRepository(CurrencyEntity)
    protected currencyEntity!: Repository<CurrencyEntity>;

    @InjectRepository(CompanyCurrencyEntity)
    protected companyCurrencyEntity!: Repository<CompanyCurrencyEntity>;

   async startInsertCompany(params: any, companyFile: any, req?: any) {
        const res = await this.insertCompany(params, companyFile, req);
        if (res.success === 1) {
            return this.finishSuccess(res, params, companyFile);
        }
        return this.finishFailure(res);
    }

async insertCompany(params: any, companyFile: any, req?: any) {
    const queryParams: any = {};
    try {
        if (params.companyName)     queryParams.companyName     = params.companyName;
        if (params.companyCode)     queryParams.companyCode     = params.companyCode;
        if (params.status)          queryParams.status          = params.status;
        if (params.email)           queryParams.email           = params.email;
        if (params.website)         queryParams.website         = params.website;
        if (params.dialCode)        queryParams.dialCode        = Number(params.dialCode);
        if (params.phone)           queryParams.phone           = params.phone;
        if (params.country)         queryParams.country         = params.country;
        if (params.state)           queryParams.state           = params.state;
        if (params.city)            queryParams.city            = params.city;
        // if (params.postalCode)      queryParams.postalCode      = Number(params.postalCode);
        if (params.AddressLineOne)  queryParams.AddressLineOne  = params.AddressLineOne;
        if (params.ownerName)       queryParams.ownerName       = params.ownerName;
        if (params.ownerEmail)      queryParams.ownerEmail      = params.ownerEmail;
        if (params.ownerPhone)      queryParams.ownerPhone      = params.ownerPhone;
        if (companyFile)            queryParams.companyFile     = companyFile.filename;
        if (params.addedBy)         queryParams.addedBy         = Number(params.addedBy);

        const result = await this.companyEntity.insert(queryParams);
        const insertId = result?.raw?.insertId;

        if (params.curId && insertId) {
            await this.companyCurrencyEntity.insert({ companyId: insertId, curId: Number(params.curId) });
        }

        return { success: 1, message: 'Inserted successfully', data: { insertData: insertId } };
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

   async startUpdate(params: any, companyFile: any, req?: any) {
        const authCtx = await resolveAuthContext(req, this.ucgEntity);
        if (!authCtx.isSuperAdmin) {
            if (Number(params.companyId) !== authCtx.activeCompanyId) {
                return { success: 0, message: 'Access denied: cannot modify another company' };
            }
        }
        const res = await this.updateCompany(params, companyFile, req);
        if (res.success === 1) {
            return this.updateSuccess(res, params);
        }
        return this.finishFailure(res);
    }

    async updateCompany(params: any, companyFile: any, req?: any) {
    if (!params.companyId) return { success: 0, message: 'companyId is mandatory' };

    try {
        const authCtx = await resolveAuthContext(req, this.ucgEntity);
        if (!authCtx.isSuperAdmin) {
            if (Number(params.companyId) !== authCtx.activeCompanyId) {
                return { success: 0, message: 'Access denied: cannot modify another company' };
            }
        }

        const queryParams: any = {};
        if (params.companyName)     queryParams.companyName     = params.companyName;
        if (params.companyCode)     queryParams.companyCode     = params.companyCode;
        if (params.companyLocation) queryParams.companyLocation = params.companyLocation;
        if (params.status)          queryParams.status          = params.status;
        if (params.email)           queryParams.email           = params.email;
        if (params.website)         queryParams.website         = params.website;
        if (params.dialCode)        queryParams.dialCode        = Number(params.dialCode);
        if (params.phone)           queryParams.phone           = params.phone;
        if (params.country)         queryParams.country         = params.country;
        if (params.state)           queryParams.state           = params.state;
        if (params.city)            queryParams.city            = params.city;
        if (params.postalCode)      queryParams.postalCode      = Number(params.postalCode);
        if (params.AddressLineOne)  queryParams.AddressLineOne  = params.AddressLineOne;
        if (params.ownerName)       queryParams.ownerName       = params.ownerName;
        if (params.ownerEmail)      queryParams.ownerEmail      = params.ownerEmail;
        if (params.ownerPhone)      queryParams.ownerPhone      = params.ownerPhone;
        if (companyFile) {
            queryParams.companyFile = companyFile.filename;
        } else if (params.removeCompanyFile === 'true') {
            queryParams.companyFile = null;
        }
        if (params.updatedBy)       queryParams.updatedBy       = Number(params.updatedBy);

        queryParams.updatedDate = () => 'NOW()';

        await this.companyEntity.update({ companyId: params.companyId }, queryParams);

        if (companyFile) {
                    await this.fileTransfer.fileTransfer3(companyFile.filename, params.companyId, params.companyId);
                }

        if (params.curId) {
            const existing = await this.companyCurrencyEntity.findOne({ where: { companyId: params.companyId } });
            if (existing) {
                await this.companyCurrencyEntity.update({ companyId: params.companyId }, { curId: Number(params.curId) });
            } else {
                await this.companyCurrencyEntity.insert({ companyId: params.companyId, curId: Number(params.curId) });
            }
        }

        return { success: 1, message: 'Updated successfully' };
    } catch (err: any) {
        return { success: 0, message: err?.message };
    }
}
    async updateSuccess(result: any, params: any) {
        return { status: result, data: params };
    }

   async getCompanies(param: any, req?: any) {
        let return_data: any = {};
        try {
            const authCtx = await resolveAuthContext(req, this.ucgEntity);
            const queryBuilder = this.companyEntity.createQueryBuilder('company');
            const alias = 'company';

            if (!authCtx.isSuperAdmin) {
                queryBuilder.andWhere('company.companyId = :activeCompanyId', { activeCompanyId: authCtx.activeCompanyId });
            }

            const queryString = await this.filter.makeFilterString(
                param?.filters,
                alias,
                {},
                param?.condition === 'Any' ? 'Any' : 'All',
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


    async getCompany(query: any, req?: any) {
        try {
            const authCtx = await resolveAuthContext(req, this.ucgEntity);
            const targetCompanyId = Number(query);
            if (!authCtx.isSuperAdmin && targetCompanyId !== authCtx.activeCompanyId) {
                throw new ForbiddenException('Access denied: cannot access another company');
            }

            const company = await this.companyEntity.findOne({
                where: { companyId: targetCompanyId },
            });

            if (!company) {
                throw new NotFoundException('Company not found');
            }

            const userRepo = this.companyEntity.manager.getRepository(UserEntity);
            const [assignments, currencyMapping, allCurrencies, addedByUser, updatedByUser] = await Promise.all([
                this.ucgEntity.find({ where: { companyId: targetCompanyId }, relations: ['user', 'group'] }),
                this.companyCurrencyEntity.findOne({ where: { companyId: targetCompanyId }, relations: ['currency'] }),
                this.currencyEntity.find({ order: { name: 'ASC' } }),
                company.addedBy ? userRepo.findOne({ where: { userId: company.addedBy }, select: ['name'] }) : null,
                company.updatedBy ? userRepo.findOne({ where: { userId: company.updatedBy }, select: ['name'] }) : null,
            ]);

            return {
                ...company,
                addedByName: addedByUser?.name ?? null,
                updatedByName: updatedByUser?.name ?? null,
                currency: currencyMapping?.currency ?? null,
                curId: currencyMapping?.curId ?? null,
                allCurrencies,
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

   async getCurrencies(req?: any) {
        return this.currencyEntity.find({ order: { name: 'ASC' } });
    }

}