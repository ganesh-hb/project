import { Module } from '@nestjs/common';
import { ActivityModule } from './activity/activity.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { typeOrmConfig } from './packages/config/typeorm.config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { GroupModule } from './group/group.module';
import { CompanyModule } from './company/company.module';
import { join } from 'path';
import { ServeStaticModule } from '@nestjs/serve-static';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { UserModule } from './user/user.module';

@Module({
    imports: [
        TypeOrmModule.forRoot(typeOrmConfig),
        ConfigModule.forRoot({ isGlobal: true }),
        ServeStaticModule.forRoot({
            rootPath: join(__dirname, '..', 'upload'),
            serveRoot: '/upload',
        }),
        EventEmitterModule.forRoot(),
        UserModule,
        GroupModule,
        CompanyModule,
        ActivityModule,
    ],
    controllers: [AppController],
    providers: [AppService],
})
export class AppModule {}