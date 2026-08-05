import {
  Inject,
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { ActivityCode } from '../activity/enums/activity-code.enum';
import { ItemCategoryEntity } from 'src/item_category/entity/item-category.entity';
import { UserCompanyGroupEntity } from 'src/packages/entity/user.company.group.entity';
import { UserEntity } from 'src/user/entity/user.entity';
import { Filter } from 'src/utilities/filter';
import { resolveAuthContext } from 'src/utilities/auth-helper';
import {
  categoryListDto,
  ItemCategoryDto,
  ItemCategoryUpdateDto,
} from './dto/item.category.dto';

@Injectable()
export class ItemCategoryService {
  @Inject()
  private readonly filter!: Filter;

  @InjectRepository(ItemCategoryEntity)
  private readonly itemCategoryEntity!: Repository<ItemCategoryEntity>;

  @InjectRepository(UserCompanyGroupEntity)
  private readonly ucgEntity!: Repository<UserCompanyGroupEntity>;

  @InjectRepository(UserEntity)
  private readonly userEntity!: Repository<UserEntity>;

  @Inject(EventEmitter2)
  private readonly eventEmitter!: EventEmitter2;

//auto generation of the code
  private async generateCategoryCode(
    itemCategoryName: string,
    companyId: number,
  ): Promise<string> {
    const prefix = itemCategoryName.trim().substring(0, 8).toUpperCase();
    let counter = 1;
    let code: string;
    do {
      code = `${prefix}${String(counter).padStart(3, '0')}`;
      const existing = await this.itemCategoryEntity.findOne({
        where: { itemCategoryCode: code, companyId: Number(companyId) },
      });
      if (!existing) break;
      counter++;
    } while (true);
    return code;
  }

  async categoryList(param: categoryListDto, req?: any) {
    let return_data: any = {};
    try {
      const authCtx = await resolveAuthContext(req, this.ucgEntity);
      const queryBuilder =
        this.itemCategoryEntity.createQueryBuilder('itemCategory');

      if (!authCtx.isSuperAdmin) {
        const scopedCompanyIds = req?.scopedCompanyIds || [
          authCtx.activeCompanyId,
        ];
        if (scopedCompanyIds.length > 0) {
          queryBuilder.andWhere(
            'itemCategory.companyId IN (:...scopedCompanyIds)',
            { scopedCompanyIds },
          );
        } else {
          return {
            success: 1,
            message: 'Item categories fetched successfully',
            total: 0,
            data: [],
          };
        }
      }

      const queryString = await this.filter.makeFilterString(
        param.filters,
        'itemCategory',
        {},
        param.condition === 'Any' ? 'Any' : 'All',
      );
      if (queryString && queryString !== '') {
        queryBuilder.andWhere(queryString);
      }

      const [skip, limit] = (await this.filter.calcPages(
        param,
        this.itemCategoryEntity,
      )) as [number, number];

      queryBuilder.skip(skip).take(limit);
      queryBuilder.orderBy('itemCategory.itemCategoryId', 'DESC');

      const [data, total] = await queryBuilder.getManyAndCount();

      return_data = {
        success: 1,
        message: 'Item categories fetched successfully',
        total,
        data,
      };
    } catch (err: any) {
      return_data = { success: 0, message: err.message };
    }
    return return_data;
  }

  async getItemCategoryDetails(id: number, req?: any) {
    const authCtx = await resolveAuthContext(req, this.ucgEntity);
    const category = await this.itemCategoryEntity.findOne({
      where: { itemCategoryId: id },
    });
    if (!category) {
      throw new NotFoundException('Item category not found');
    }

    if (!authCtx.isSuperAdmin) {
      const scopedCompanyIds = req?.scopedCompanyIds || [
        authCtx.activeCompanyId,
      ];
      if (!scopedCompanyIds.includes(Number(category.companyId))) {
        throw new ForbiddenException(
          'Access denied: item category belongs to another company',
        );
      }
    }

    const addedByUser = category.addedBy
      ? await this.userEntity.findOne({ where: { userId: category.addedBy } })
      : null;
    const updatedByUser = category.updatedBy
      ? await this.userEntity.findOne({
          where: { userId: category.updatedBy },
        })
      : null;

    return {
      ...category,
      addedByName: addedByUser?.name ?? null,
      updatedByName: updatedByUser?.name ?? null,
    };
  }

  async insertItemCategory(params: ItemCategoryDto, req?: any) {
    try {
      const authCtx = await resolveAuthContext(req, this.ucgEntity);

      if (!authCtx.isSuperAdmin) {
        const scopedCompanyIds = req?.scopedCompanyIds || [
          authCtx.activeCompanyId,
        ];
        if (!scopedCompanyIds.includes(Number(params.companyId))) {
          return {
            success: 0,
            message: 'Access denied: cannot add item category to another company',
          };
        }
      }

      // Auto-generate unique code scoped per company
      const itemCategoryCode = await this.generateCategoryCode(
        params.itemCategoryName,
        Number(params.companyId),
      );

      const performerId = req?.user?.isImpersonation
        ? req?.user?.impersonatedBy
        : (req?.user?.userId ?? params.addedBy);
      const performerEmail = req?.user?.isImpersonation
        ? req?.user?.impersonatorEmail
        : (req?.user?.email ?? '');

      const queryParams: any = {
        itemCategoryCode,
        itemCategoryName: params.itemCategoryName,
        companyId: Number(params.companyId),
        status: params.status,
        type: params.type,
      };
      if (performerId) queryParams.addedBy = Number(performerId);
      queryParams.addedDate = new Date();

      const result = await this.itemCategoryEntity.insert(queryParams);
      const insertId = result?.raw?.insertId;

      this.eventEmitter.emit('activity.log', {
        activityCode: ActivityCode.ITEM_CATEGORY_CREATE,
        userId: performerId,
        companyId: Number(params.companyId),
        actorType: 'USER',
        targetType: 'ITEM_CATEGORY',
        targetId: String(insertId),
        executionStatus: 'SUCCESS',
        severity: 'INFO',
        parameters: {
          userEmail: performerEmail,
          userGroup: authCtx.activeGroupName || 'N/A',
          itemCategoryCode,
          itemCategoryName: params.itemCategoryName,
          type: params.type || '',
          companyId: params.companyId,
          impersonated: !!req?.user?.isImpersonation,
        },
        metadata: {},
      });

      return {
        success: 1,
        message: 'Item category inserted successfully',
        data: { insertData: insertId },
      };
    } catch (err: any) {
      return { success: 0, message: err.message };
    }
  }

  async updateItemCategory(params: ItemCategoryUpdateDto, req?: any) {
    if (!params.itemCategoryId) {
      return { success: 0, message: 'itemCategoryId is mandatory' };
    }
    try {
      const authCtx = await resolveAuthContext(req, this.ucgEntity);
      const existingCategory = await this.itemCategoryEntity.findOne({
        where: { itemCategoryId: Number(params.itemCategoryId) },
      });
      if (!existingCategory) {
        return { success: 0, message: 'Item category not found' };
      }

      if (!authCtx.isSuperAdmin) {
        const scopedCompanyIds = req?.scopedCompanyIds || [
          authCtx.activeCompanyId,
        ];
        if (!scopedCompanyIds.includes(Number(existingCategory.companyId))) {
          return {
            success: 0,
            message: 'Access denied: cannot update item category of another company',
          };
        }
      }

      const queryParams: any = {};
      if (params.itemCategoryName !== undefined)
        queryParams.itemCategoryName = params.itemCategoryName;
      if (params.type !== undefined) queryParams.type = params.type;
      if (params.status) queryParams.status = params.status;

      const performerId = req?.user?.isImpersonation
        ? req?.user?.impersonatedBy
        : (req?.user?.userId ?? params.updatedBy);
      const performerEmail = req?.user?.isImpersonation
        ? req?.user?.impersonatorEmail
        : (req?.user?.email ?? '');

      if (performerId) queryParams.updatedBy = Number(performerId);
      queryParams.updatedDate = new Date();

      await this.itemCategoryEntity.update(
        { itemCategoryId: Number(params.itemCategoryId) },
        queryParams,
      );

      this.eventEmitter.emit('activity.log', {
        activityCode: ActivityCode.ITEM_CATEGORY_UPDATE,
        userId: performerId,
        companyId: existingCategory.companyId,
        actorType: 'USER',
        targetType: 'ITEM_CATEGORY',
        targetId: String(params.itemCategoryId),
        executionStatus: 'SUCCESS',
        severity: 'INFO',
        parameters: {
          userEmail: performerEmail,
          userGroup: authCtx.activeGroupName || 'N/A',
          itemCategoryCode: existingCategory.itemCategoryCode,
          itemCategoryName:
            params.itemCategoryName ?? existingCategory.itemCategoryName,
          type: params.type ?? existingCategory.type ?? '',
          status: params.status ?? existingCategory.status,
          impersonated: !!req?.user?.isImpersonation,
        },
        metadata: {},
      });

      return {
        success: 1,
        message: 'Item category updated successfully',
      };
    } catch (err: any) {
      return { success: 0, message: err.message };
    }
  }
}