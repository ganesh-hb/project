import { Body, Controller, Get, Param, Post, Put, Req, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from "@nestjs/platform-express";
import { multerConfig } from 'src/packages/config/multer.config';
import { GroupService } from './group.service';
import { getGroupListDto, GroupDto, GroupUpdateDto } from 'src/packages/dto/group.dto';
import { AuthGuard } from '@nestjs/passport';


@Controller('group')
export class GroupController {
  constructor(private readonly groupService:GroupService){}
    @Get()
    async hello(){
      return "hello"
    }

    @Post('group-add')
     @UseGuards(AuthGuard('jwt'))
    @UseInterceptors(FileInterceptor('groupFile', multerConfig))
    async insertGroup(@Req() req, @Body() body: GroupDto, @UploadedFile() groupFile: Express.Multer.File){
            let param = body
            return await this.groupService.startInsertGroup(param)
    }


    @Put('group-update') 
    @UseInterceptors(FileInterceptor('groupFile', multerConfig))
    async updateGroup(@Body() body: GroupUpdateDto, @UploadedFile() groupFile: Express.Multer.File) {
        try {
           return await this.groupService.startUpdate(body)
     
        } catch (err) {
            return err
        }
    }


    @Post('group-list')
    @UseGuards(AuthGuard('jwt'))
    @UseInterceptors(FileInterceptor('groupFile', multerConfig))
    async getGroups(@Body() body:getGroupListDto) {
    return await this.groupService.getGroups(body)
  }


    @Get("group-details/:id")
    async getGroup(@Param('id') param) {
        return await this.groupService.getGroup(param)
    }

}
