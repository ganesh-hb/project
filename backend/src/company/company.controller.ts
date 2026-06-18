import { Body, Controller, Get, Param, Post, Put, Req, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from "@nestjs/platform-express";
import { multerConfig } from 'src/packages/config/multer.config';
import { CompanyService } from './company.service';
import { CompanyDto, CompanyUpdateDto, getCompanyListDto } from 'src/packages/dto/company.dto';


@Controller('company')
export class CompanyController {
  constructor(private readonly companyService:CompanyService){}
    @Get()
    async hello(){
      return "hello"
    }

    @Post('company-add')
    @UseInterceptors(FileInterceptor('companyFile', multerConfig))
    async insertCompany(@Req() req, @Body() body: CompanyDto, @UploadedFile() companyFile: Express.Multer.File){
            if (companyFile) {
                let allowedTypes = ["image/jpeg", "image/jpg", "image/png"]

                if (!allowedTypes.includes(companyFile.mimetype)){
                    return {
                        status: 0,
                        message: "invalid File type"
                    }
                }
            }else{
              return "File required!!!"
            }
            let param = body
            return await this.companyService.startInsertCompany(param,companyFile)
    }


    @Put('company-update') 
    @UseInterceptors(FileInterceptor('companyFile', multerConfig))
    async updateCompany(@Body() body: CompanyUpdateDto, @UploadedFile() companyFile: Express.Multer.File) {
        try {
            if (companyFile) {
                let allowedTypes = ["image/jpeg", "image/jpg", "image/png"]

                if (!allowedTypes.includes(companyFile.mimetype)) {
                    return {
                        status: 0,
                        message: "invalid File type"
                    }
                }
                return await this.companyService.startUpdate(body,companyFile)
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


    @Post('company-list')
    @UseInterceptors(FileInterceptor('companyFile', multerConfig))
    async getCompanys(@Body() body:getCompanyListDto) {
    return await this.companyService.getCompanys(body)
  } 

    @Get("company-details/:id")
    async getCompany(@Param('id') param) {
        return await this.companyService.getCompany(param)
    }

}
