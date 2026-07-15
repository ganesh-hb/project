import { Body, ConsoleLogger, Controller, Get, Param, Post, Put, Req, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from "@nestjs/platform-express";
import { multerConfig } from 'src/packages/config/multer.config';
import { CompanyService } from './company.service';
import { CompanyDto, CompanyUpdateDto, getCompanyListDto } from 'src/packages/dto/company.dto';
import { AuthGuard } from '@nestjs/passport';
import { PermissionsGuard, RequirePermission } from 'src/utilities/permissions.guard';


@Controller('company')
export class CompanyController {
  constructor(private readonly companyService:CompanyService){}
    @Get()
    async hello(){
      return "hello"
    }

    @Post('company-add')
    @UseGuards(AuthGuard('jwt'), PermissionsGuard)
    @RequirePermission('companyAdd')
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
            }
            let param = { ...body, addedBy: req.user.userId };
            return await this.companyService.startInsertCompany(param, companyFile, req)
    }


    @Put('company-update')
    @UseGuards(AuthGuard('jwt'), PermissionsGuard)
    @RequirePermission('companyUpdate')
    @UseInterceptors(FileInterceptor('companyFile', multerConfig))
    async updateCompany(@Req() req, @Body() body: CompanyUpdateDto, @UploadedFile() companyFile: Express.Multer.File) {
        try {
            if (companyFile) {
                const allowedTypes = ["image/jpeg", "image/jpg", "image/png"];
                if (!allowedTypes.includes(companyFile.mimetype)) {
                    return { status: 0, message: "invalid File type" };
                }
            }
            let param = { ...body, updatedBy: req.user.userId };
            return await this.companyService.startUpdate(param, companyFile || null, req);
        } catch (err) {
            return err;
        }
    }


    @Post('company-list')
    @UseGuards(AuthGuard('jwt'), PermissionsGuard)
    @RequirePermission('companyView')
    @UseInterceptors(FileInterceptor('companyFile', multerConfig))
    async getCompanys(@Req() req, @Body() body:getCompanyListDto) {
    return await this.companyService.getCompanies(body, req)
  } 

    @Get("company-details/:id")
    @UseGuards(AuthGuard('jwt'), PermissionsGuard)
   @RequirePermission('companyView')
    async getCompany(@Req() req, @Param('id') param) {
        return await this.companyService.getCompany(param, req);
    }

    @Get('currency-list')
    @UseGuards(AuthGuard('jwt'))
    async getCurrencies(@Req() req) {
        return this.companyService.getCurrencies(req);
    }
}
