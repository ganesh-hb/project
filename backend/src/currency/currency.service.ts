import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Not } from 'typeorm';
import { CurrencyEntity } from 'src/packages/entity/currency.entity';
import { Filter } from 'src/utilities/filter';
import { getCurrencyListDto, CurrencyDto, CurrencyUpdateDto } from 'src/packages/dto/currency.dto';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { ActivityCode } from '../activity/enums/activity-code.enum';

@Injectable()
export class CurrencyService {
  @Inject()
  private readonly filter!: Filter;

  @InjectRepository(CurrencyEntity)
  private readonly currencyEntity!: Repository<CurrencyEntity>;

  @Inject(EventEmitter2)
  private readonly eventEmitter!: EventEmitter2;

  async getCurrencies(param: getCurrencyListDto, req?: any) {
    let return_data: any = {};
    try {
      const queryBuilder = this.currencyEntity.createQueryBuilder('currency');
      
      const queryString = await this.filter.makeFilterString(
        param.filters,
        'currency',
      );
      if (queryString && queryString !== '') {
        queryBuilder.andWhere(queryString);
        queryBuilder.orderBy('name','ASC')
      }

      const [skip, limit] = (await this.filter.calcPages(
        param,
        this.currencyEntity,
      )) as [number, number];
      
      queryBuilder.skip(skip).take(limit);
      queryBuilder.orderBy('name','ASC')

      const [data, total] = await queryBuilder.getManyAndCount();

      return_data = {
        success: 1,
        message: 'Currencies fetched successfully',
        total,
        data,
      };
    } catch (err: any) {
      return_data = { success: 0, message: err.message };
    }
    return return_data;
  }

  async getCurrencyDetails(id: number, req?: any) {
    const currency = await this.currencyEntity.findOne({
      where: { curId: id },
    });
    if (!currency) {
      throw new NotFoundException('Currency not found');
    }
    const baseCurrency:string=process.env.CURRENCY_CONVERSION || "";
    return{...currency,baseCurrency}
    
  }
  

  async insertCurrency(params: CurrencyDto, req?: any) {
    try {
      if (params.code) {
        const existingCode = await this.currencyEntity.findOne({
          where: { code: params.code },
        });
        if (existingCode) {
          return { success: 0, message: 'Currency code already exists' };
        }
      }

      const queryParams: any = {};
      if (params.name) queryParams.name = params.name;
      if (params.code) queryParams.code = params.code;
      if (params.symbol) queryParams.symbol = params.symbol;
      if (params.conversionRate !== undefined) queryParams.conversionRate = Number(params.conversionRate);
      if (params.status) queryParams.status = params.status;

      const performerId = req?.user?.isImpersonation ? req?.user?.impersonatedBy : (req?.user?.userId ?? params.addedBy);
      const performerEmail = req?.user?.isImpersonation ? req?.user?.impersonatorEmail : (req?.user?.email ?? '');

      if (performerId) {
        queryParams.addedBy = performerId;
      }
      queryParams.addedDate = new Date();

      const result = await this.currencyEntity.insert(queryParams);
      const insertId = result?.raw?.insertId;
      this.eventEmitter.emit('activity.log', {
        activityCode: ActivityCode.CURRENCY_CREATE,
        userId: performerId,
        actorType: 'USER',
        targetType: 'CURRENCY',
        targetId: String(insertId),
        executionStatus: 'SUCCESS',
        severity: 'INFO',
        parameters: {
          userEmail: performerEmail,
          name: params.name,
          code: params.code,
          impersonated: !!req?.user?.isImpersonation
        },
        metadata: {},
      });

      return {
        success: 1,
        message: 'Currency inserted successfully',
        data: { insertData: insertId },
      };
    } catch (err: any) {
      return { success: 0, message: err.message };
    }
  }

  async updateCurrency(params: CurrencyUpdateDto, req?: any) {
    if (!params.curId) {
      return { success: 0, message: 'curId is mandatory' };
    }

    try {
      if (params.code) {
        const existingCode = await this.currencyEntity.findOne({
          where: {
            code: params.code,
            curId: Not(Number(params.curId)),
          },
        });
        if (existingCode) {
          return { success: 0, message: 'Currency code already exists' };
        }
      }

      const queryParams: any = {};
      if (params.name) queryParams.name = params.name;
      if (params.code) queryParams.code = params.code;
      if (params.symbol) queryParams.symbol = params.symbol;
      if (params.conversionRate !== undefined) queryParams.conversionRate = Number(params.conversionRate);
      if (params.status) queryParams.status = params.status;

      const performerId = req?.user?.isImpersonation ? req?.user?.impersonatedBy : (req?.user?.userId ?? params.updatedBy);
      const performerEmail = req?.user?.isImpersonation ? req?.user?.impersonatorEmail : (req?.user?.email ?? '');

      if (performerId) {
        queryParams.updatedBy = performerId;
      } 
      queryParams.updatedDate = new Date();

      await this.currencyEntity.update({ curId: Number(params.curId) }, queryParams);

      this.eventEmitter.emit('activity.log', {
        activityCode: ActivityCode.CURRENCY_UPDATE,
        userId: performerId,
        actorType: 'USER',
        targetType: 'CURRENCY',
        targetId: String(params.curId),
        executionStatus: 'SUCCESS',
        severity: 'INFO',
        parameters: {
          userEmail: performerEmail,
          name: params.name || '',
          code: params.code || '',
          impersonated: !!req?.user?.isImpersonation
        },
        metadata: {},
      });

      return {
        success: 1,
        message: 'Currency updated successfully',
      };
    } catch (err: any) {
      return { success: 0, message: err.message };
    }
  }

  async syncCurrency(body: getCurrencyListDto, req: any) {
    try {
      if (!process.env.EXCHANGE_API || !process.env.CURRENCY_CONVERSION) {
        return { success: 0, message: "Missing exchange API configuration in environment" };
      }

      const url = process.env.EXCHANGE_API + process.env.CURRENCY_CONVERSION;
      const response = await fetch(url);
      if (!response.ok) {
        return { success: 0, message: `Failed to fetch exchange rates: status ${response.status}` };
      }

      const data = await response.json();
      if (data.result !== 'success') {
        return { success: 0, message: data['error-type'] || 'API call was not successful' };
      }

      const conversionRates = data.conversion_rates;
      if (!conversionRates) {
        return { success: 0, message: 'Invalid API response format: missing conversion_rates' };
      }

      const existingCurrencies = await this.currencyEntity.find();
      const updates: Promise<any>[] = [];

      for (const cur of existingCurrencies) {
        if (cur.code && conversionRates[cur.code] !== undefined) {
          const rate = Number(conversionRates[cur.code]);
          updates.push(
            this.currencyEntity.update({ curId: cur.curId }, { conversionRate: rate })
          );
          this.currencyEntity.update({ curId: cur.curId }, { lastSync: new Date() });

        }
      }

      if (updates.length > 0) {
        await Promise.all(updates);
      }

      const performerId = req?.user?.isImpersonation ? req?.user?.impersonatedBy : (req?.user?.userId ?? null);
      const performerEmail = req?.user?.isImpersonation ? req?.user?.impersonatorEmail : (req?.user?.email ?? '');

      this.eventEmitter.emit('activity.log', {
        activityCode: ActivityCode.CURRENCY_UPDATE,
        userId: performerId,
        actorType: 'USER',
        targetType: 'CURRENCY',
        targetId: 'ALL',
        executionStatus: 'SUCCESS',
        severity: 'INFO',
        parameters: {
          userEmail: performerEmail,
          name: 'All Currencies',
          code: 'ALL_SYNC',
          impersonated: !!req?.user?.isImpersonation
        },
        metadata: {},
      });

      return {
        success: 1,
        message: 'Currencies synced successfully',
      };
    } catch (err: any) {
      return { success: 0, message: err.message };
    }
  }
}

