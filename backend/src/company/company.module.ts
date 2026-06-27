import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { CompanyController } from './company.controller';
import { CompanyService } from './company.service';

import { CompanyEntity } from 'src/packages/entity/company.entity';
import { FileTransfer } from 'src/utilities/file.transfer';
import { Filter } from 'src/utilities/filter';
import { Mailer } from 'src/utilities/mailer';
import { UserCompanyGroupEntity } from 'src/packages/entity/user.company.group.entity';
import { GroupPermissionEntity } from 'src/packages/entity/capability.entity';

@Module({
    imports: [
        TypeOrmModule.forFeature([
            CompanyEntity,
            UserCompanyGroupEntity,
            GroupPermissionEntity,
        ]),
    ],
    controllers: [CompanyController],
    providers: [CompanyService, Filter, Mailer, FileTransfer],
})
export class CompanyModule {}