import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ActivityMasterEntity } from 'src/packages/entity/activity-master.entity';
import { ActivityLogEntity } from 'src/packages/entity/activity-log.entity';
import { UserCompanyGroupEntity } from 'src/packages/entity/user.company.group.entity';
import { ActivityController } from './activity.controller';
import { ActivityService } from './activity.service';

import { ActivityListener } from './listeners/activity.listener';
import { Filter } from 'src/utilities/filter';
import { RolesGuard } from 'src/utilities/roles.guard';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from 'src/utilities/jwt.strategy';

@Module({
    imports: [
        TypeOrmModule.forFeature([
            ActivityMasterEntity,
            ActivityLogEntity,
            UserCompanyGroupEntity,
        ]),
        PassportModule.register({ defaultStrategy: 'jwt' }),
        JwtModule.register({
            secret: process.env.JWT_SECRET || 'hiddenbrains',
            signOptions: { expiresIn: '1d' },
        }),
    ],
    controllers: [ActivityController],
    providers: [
        ActivityService,

        ActivityListener,
        Filter,
        RolesGuard,
        JwtStrategy,
    ],
    exports: [ActivityService],
})
export class ActivityModule {}