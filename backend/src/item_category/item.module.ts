import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ItemCategoryController } from './item.controller';
import { ItemCategoryService } from './item.service';
import { ItemCategoryEntity } from 'src/item_category/entity/item-category.entity';
import { CompanyEntity } from '../packages/entity/company.entity';
import { UserCompanyGroupEntity } from '../packages/entity/user.company.group.entity';
import { UserEntity } from '../packages/entity/user.entity';
import { GroupPermissionEntity } from '../packages/entity/capability.entity';
import { Filter } from 'src/utilities/filter';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ItemCategoryEntity,
      CompanyEntity,
      UserCompanyGroupEntity,
      UserEntity,
      GroupPermissionEntity,
    ]),
  ],
  controllers: [ItemCategoryController],
  providers: [ItemCategoryService, Filter],
  exports: [TypeOrmModule],
})
export class ItemCategoryModule {}
