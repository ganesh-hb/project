import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { CompanyEntity } from "src/company/entity/company.entity";
import { GroupPermissionEntity } from "src/group/entity/capability.entity";
import { UserCompanyGroupEntity } from "src/packages/entity/user.company.group.entity";
import { UserEntity } from "src/user/entity/user.entity";
import { Filter } from "src/utilities/filter";
import { BrandContorller } from "./brand.controller";
import { BrandService } from "./brand.service";
import { BrandEntity } from "./entity/brand.entity";

@Module({
  imports: [
    TypeOrmModule.forFeature([
      CompanyEntity,
      BrandEntity,
      UserCompanyGroupEntity,
      UserEntity,
      GroupPermissionEntity,
    ]),
  ],
  controllers: [BrandContorller],
  providers: [BrandService,Filter],
  exports: [TypeOrmModule],
})
export class BrandModule {}