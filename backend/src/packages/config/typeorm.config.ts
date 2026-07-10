import { TypeOrmModuleOptions } from "@nestjs/typeorm";
import "dotenv/config";
import { UserEntity } from "src/packages/entity/user.entity";
import { GroupEntity } from "../entity/group.entity";
import { CompanyEntity } from "../entity/company.entity";
import { UserCompanyGroupEntity } from "../entity/user.company.group.entity";
import { PermissionEntity, GroupPermissionEntity } from "../entity/capability.entity";
import { CurrencyEntity } from "../entity/currency.entity";
import { CompanyCurrencyEntity } from "../entity/company.currency.entity";
import { ActivityMasterEntity } from "../entity/activity-master.entity";
import { ActivityLogEntity } from "../entity/activity-log.entity";

export const typeOrmConfig: TypeOrmModuleOptions = {
    type: process.env.DB_CLIENT as "mysql" ?? "mysql",
    host: process.env.DB_HOST ?? "localhost",
    port: Number(process.env.DB_PORT) ?? 3306,
    username: process.env.DB_USER ?? "root",
    password: process.env.DB_PASS ?? "root",
    database: process.env.DB_NAME ?? "project",
    entities: [
        UserEntity,
        GroupEntity,
        CompanyEntity,
        UserCompanyGroupEntity,
        PermissionEntity,
        GroupPermissionEntity,
        CurrencyEntity,
        CompanyCurrencyEntity,
        ActivityMasterEntity,
        ActivityLogEntity,
    ],
    synchronize: true,
    migrationsRun: false,
    logging: false,
    // point to the actual migration directory
    migrations: [__dirname + "/migration/*{.ts,.js}"],
};