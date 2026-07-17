import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CurrencyController } from './currency.controller';
import { CurrencyService } from './currency.service';
import { CurrencyEntity } from 'src/packages/entity/currency.entity';
import { UserCompanyGroupEntity } from 'src/packages/entity/user.company.group.entity';
import { GroupPermissionEntity } from 'src/packages/entity/capability.entity';
import { Filter } from 'src/utilities/filter';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      CurrencyEntity,
      UserCompanyGroupEntity,
      GroupPermissionEntity,
    ]),
  ],
  controllers: [CurrencyController],
  providers: [CurrencyService, Filter],
  exports: [CurrencyService],
})
export class CurrencyModule {}
