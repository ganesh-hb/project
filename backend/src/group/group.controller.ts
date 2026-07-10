import { Body, Controller, Get, Param, Post, Put, Req, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { multerConfig } from 'src/packages/config/multer.config';
import { GroupService } from './group.service';
import { getGroupListDto, GroupDto, GroupUpdateDto } from 'src/packages/dto/group.dto';
import { AuthGuard } from '@nestjs/passport';
import { PermissionsGuard, RequirePermission } from 'src/utilities/permissions.guard';
import { RolesGuard } from 'src/utilities/roles.guard';
import { Roles } from 'src/utilities/roles.decorator';


@Controller('group')
export class GroupController {
    constructor(private readonly groupService: GroupService) {}

    @Get()
    async hello() { return 'hello'; }

    @Post('group-add')
    @UseGuards(AuthGuard('jwt'))
    @UseGuards(AuthGuard('jwt'), PermissionsGuard)
    @RequirePermission('groupAdd')
    @UseInterceptors(FileInterceptor('groupFile', multerConfig))
    async insertGroup(@Req() req, @Body() body: GroupDto, @UploadedFile() groupFile: Express.Multer.File) {
        let param = { ...body, addedBy: req.user.userId };
        return await this.groupService.startInsertGroup(param);
    }

    @Put('group-update')
    @UseGuards(AuthGuard('jwt'))
     @UseGuards(AuthGuard('jwt'), PermissionsGuard)
    @RequirePermission('groupUpdate')
    async updateGroup(@Req() req, @Body() body: GroupUpdateDto) {
        try {
            let param = { ...body, updatedBy: req.user.userId };
            return await this.groupService.startUpdate(param);
        } catch (err) {
            return err;
        }
    }

    @Post('group-list')
    @UseGuards(AuthGuard('jwt'))
        @UseGuards(AuthGuard('jwt'), PermissionsGuard)
    @RequirePermission('groupList')
    async getGroups(@Body() body: getGroupListDto) {
        return await this.groupService.getGroups(body);
    }

    @Get('group-details/:id')
    @UseGuards(AuthGuard('jwt'), PermissionsGuard)
    @RequirePermission('groupList')
    async getGroup(@Param('id') param) {
        return await this.groupService.getGroup(param);
    }

@Get('permissions-all')
    @UseGuards(AuthGuard('jwt'), RolesGuard)
    @Roles('superAdmin')
    async getAllPermissions() {
        return await this.groupService.getAllPermissions();
    }

    @Get('group-permissions/:groupId')
    @UseGuards(AuthGuard('jwt'), RolesGuard)
    @Roles('superAdmin')
    async getGroupPermissions(@Param('groupId') groupId: string) {
        return await this.groupService.getGroupPermissions(Number(groupId));
    }

    @Post('group-permissions-save')
    @UseGuards(AuthGuard('jwt'), RolesGuard)
    @Roles('superAdmin')
    async saveGroupPermissions(@Body() body: { groupId: number; permissions: string[] }) {
        return await this.groupService.saveGroupPermissions(Number(body.groupId), body.permissions);
    }

}