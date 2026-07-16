import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { GroupController } from './group.controller';
import { GroupService } from './group.service';

import { GroupEntity } from 'src/packages/entity/group.entity';
import { FileTransfer } from 'src/utilities/file.transfer';
import { Filter } from 'src/utilities/filter';
import { Mailer } from 'src/utilities/mailer';
import { UserCompanyGroupEntity } from 'src/packages/entity/user.company.group.entity';
import {
  PermissionEntity,
  GroupPermissionEntity,
} from 'src/packages/entity/capability.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      GroupEntity,
      UserCompanyGroupEntity,
      PermissionEntity,
      GroupPermissionEntity,
    ]),
  ],
  controllers: [GroupController],
  providers: [GroupService, Filter, Mailer, FileTransfer],
  exports: [TypeOrmModule],
})
export class GroupModule {}
