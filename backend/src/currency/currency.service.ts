import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CurrencyEntity } from 'src/packages/entity/currency.entity';
import { Filter } from 'src/utilities/filter';
import { getCurrencyListDto } from 'src/packages/dto/currency.dto';

@Injectable()
export class CurrencyService {
  @Inject()
  private readonly filter!: Filter;

  @InjectRepository(CurrencyEntity)
  private readonly currencyEntity!: Repository<CurrencyEntity>;

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
      }

      const [skip, limit] = (await this.filter.calcPages(
        param,
        this.currencyEntity,
      )) as [number, number];
      
      queryBuilder.skip(skip).take(limit);

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
    return currency;
  }
}
