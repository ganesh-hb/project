import { TypeOrmModuleOptions } from "@nestjs/typeorm";
import { join } from "path";
import "dotenv/config"
import { UserEntity  } from "src/packages/entity/user.entity";
import { GroupEntity } from "../entity/group.entity";
import { CompanyEntity } from "../entity/company.entity";
import { UserCompanyGroupEntity } from "../entity/user.company.group.entity";
export const typeOrmConfig: TypeOrmModuleOptions = {
    type: process.env.DB_CLIENT as "mysql" ?? "mysql",
    host: process.env.DB_HOST ?? "localhost",
    port: Number(process.env.DB_PORT) ?? 3306,
    username: process.env.DB_USER ?? "root",
    password: process.env.DB_PASS ?? "root",
    database: process.env.DB_NAME ?? "project",
    entities: [
        UserEntity,GroupEntity,CompanyEntity,UserCompanyGroupEntity
    ],  
    synchronize: true,
    migrationsRun: false,
    logging: false,
    migrations: [__dirname + "/migrations/*.ts"],
};


//  join(__dirname, "*.entity{.ts,.js}"),

