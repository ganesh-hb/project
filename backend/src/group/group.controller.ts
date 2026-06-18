import { Body, Controller, Get, Param, Post, Put, Req, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from "@nestjs/platform-express";
import { multerConfig } from 'src/packages/config/multer.config';
import { GroupService } from './group.service';
import { getGroupListDto, GroupDto, GroupUpdateDto } from 'src/packages/dto/group.dto';


@Controller('group')
export class GroupController {
  constructor(private readonly groupService:GroupService){}
    @Get()
    async hello(){
      return "hello"
    }

    @Post('group-add')
    @UseInterceptors(FileInterceptor('groupFile', multerConfig))
    async insertGroup(@Req() req, @Body() body: GroupDto, @UploadedFile() groupFile: Express.Multer.File){
            if (groupFile) {
                let allowedTypes = ["image/jpeg", "image/jpg", "image/png"]

                if (!allowedTypes.includes(groupFile.mimetype)){
                    return {
                        status: 0,
                        message: "invalid File type"
                    }
                }
            }else{
              return "File required!!!"
            }
            let param = body
            return await this.groupService.startInsertGroup(param,groupFile)
    }


    @Put('group-update') 
    @UseInterceptors(FileInterceptor('groupFile', multerConfig))
    async updateGroup(@Body() body: GroupUpdateDto, @UploadedFile() groupFile: Express.Multer.File) {
        try {
            if (groupFile) {
                let allowedTypes = ["image/jpeg", "image/jpg", "image/png"]

                if (!allowedTypes.includes(groupFile.mimetype)) {
                    return {
                        status: 0,
                        message: "invalid File type"
                    }
                }
                return await this.groupService.startUpdate(body,groupFile)
            }else{
                return {
                    status : 0,
                    message :"file should not be empty "
                }
            }
     
        } catch (err) {
            return err
        }
    }


    @Post('group-list')
    @UseInterceptors(FileInterceptor('groupFile', multerConfig))
    async getGroups(@Body() body:getGroupListDto) {
    return await this.groupService.getGroups(body)
  }


    @Get("group-details/:id")
    async getGroup(@Param('id') param) {
        return await this.groupService.getGroup(param)
    }

}
