import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { UserController } from './user.controller';
import { UserService } from './user.service';

import { UserEntity } from 'src/packages/entity/user.entity';
import { GroupEntity } from 'src/packages/entity/group.entity';
import { CompanyEntity } from 'src/packages/entity/company.entity';
import { FileTransfer } from 'src/utilities/file.transfer';
import { Filter } from 'src/utilities/filter';
import { Mailer } from 'src/utilities/mailer';
import { UserCompanyGroupEntity } from 'src/packages/entity/user.company.group.entity';

import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from 'src/utilities/jwt.strategy';
import { PassportModule } from '@nestjs/passport';
import { RolesGuard } from 'src/utilities/roles.guard';
import { GroupPermissionEntity } from 'src/packages/entity/capability.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      UserEntity,
      GroupEntity,
      CompanyEntity,
      UserCompanyGroupEntity,
      GroupPermissionEntity,
    ]),

    PassportModule.register({ defaultStrategy: 'jwt' }),

    JwtModule.register({
      secret: process.env.JWT_SECRET || 'hiddenbrains',
      signOptions: {
        expiresIn: '1d',
      },
    }),
  ],

  controllers: [UserController],
  providers: [
    UserService,
    FileTransfer,
    Filter,
    Mailer,
    JwtStrategy,
    RolesGuard,
  ],
})
export class UserModule {}
