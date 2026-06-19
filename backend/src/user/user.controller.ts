import {
    Body,
    Controller,
    Get,
    Param,
    Post,
    Put,
    Req,
    UploadedFile,
    UseGuards,
    UseInterceptors,
} from '@nestjs/common';
import { UserService } from './user.service';
import { FileInterceptor } from "@nestjs/platform-express";
import { multerConfig } from 'src/packages/config/multer.config';
import {
    changePass,
    confirmOtp,
    forgotPass,
    getUserListDto,
    login,
    resetpass,
    UserDto,
    userUpdateDto,
} from 'src/packages/dto/user.dto';
import { encryptResponse } from 'src/utilities/crypto';
import { AuthGuard } from '@nestjs/passport';
import { Roles } from 'src/utilities/roles.decorator';

@Controller('user')
export class UserController {
    constructor(private readonly userService: UserService) { }

    @Get()
    async hello() {
        return "hello";
    }

    @Post('user-add')
    @UseGuards(AuthGuard('jwt'))
    @Roles('superAdmin', 'companyAdmin', 'warehouseAdmin')
    @UseInterceptors(FileInterceptor('userFile', multerConfig))
    async insertUser(
        @Req() req,
        @Body() body: UserDto,
        @UploadedFile() userFile: Express.Multer.File,
    ) {
        if (!userFile) return "File required!!!";

        const allowedTypes = ["image/jpeg", "image/jpg", "image/png"];
        if (!allowedTypes.includes(userFile.mimetype)) {
            return { status: 0, message: "Invalid file type" };
        }

        const result = await this.userService.startInsertUser(body,userFile);
        return {
            encrypted: encryptResponse(result),
        };
    }

    @Put('user-changepass')
      @UseGuards(AuthGuard('jwt'))
    @UseInterceptors(FileInterceptor('userFile', multerConfig))
    async ChangePass(@Body() body: changePass) {
        // console.log(body,"##########################controller")
        return await this.userService.startChangePass(body);
    }

    @Put('user-forgotpass')
    @UseInterceptors(FileInterceptor('userFile', multerConfig))
    async updatePass(@Body() body: forgotPass) {
        return await this.userService.startForgotPass(body);
    }

    @Put('user-update')
    @Roles('superAdmin', 'companyAdmin', 'warehouseAdmin')
      @UseGuards(AuthGuard('jwt'))
    @UseInterceptors(FileInterceptor('userFile', multerConfig))
    async updateUser(
        @Body() body: userUpdateDto,
        @UploadedFile() userFile: Express.Multer.File,
    ) {
        try {
            console.log(body)
            if (userFile) {
                const allowedTypes = ["image/jpeg", "image/jpg", "image/png"];
                if (!allowedTypes.includes(userFile.mimetype)) {
                    return { status: 0, message: "Invalid file type" };
                }
            }
            // console.log(body,",############################## in the update controller")

            const result = await this.userService.startUpdate(body,userFile);

            return {
                encrypted: encryptResponse(result),
            };
        } catch (err) {
            return err;
        }
    }

    @Post('user-login')
    @UseInterceptors(FileInterceptor('userFile', multerConfig))
    async login(@Body() body: login) {
        const result = await this.userService.login(body);
        return {
        encrypted: encryptResponse(result),
};
    }

    @Post('user-list')
    @UseGuards(AuthGuard('jwt'))
    @Roles('superAdmin', 'companyAdmin', 'warehouseAdmin')
    @UseInterceptors(FileInterceptor('userFile', multerConfig))
    async getUsers(@Body() body: getUserListDto) {

    const result = await this.userService.getUsers(body);
    // console.log(encryptResponse(result))
    return {
        encrypted: encryptResponse(result),
    };
    }

    @Get("user-details/:id")
     @UseGuards(AuthGuard('jwt'))
    @Roles('superAdmin', 'companyAdmin', 'warehouseAdmin')
    async getUser(@Param('id') param) {
    const result = await this.userService.getUser(param);
    // console.log(result)
    // console.log(encryptResponse(result))
    return {
        encrypted: encryptResponse(result),
    };
    }

    @Post('user-confirm-otp')
    @UseInterceptors(FileInterceptor('userFile', multerConfig))
    async confirmOtp(@Body() body: confirmOtp) {
        return await this.userService.confirmOtp(body);
    }

    @Post('user-resetpass')
    @UseInterceptors(FileInterceptor('userFile', multerConfig))
    async resetPass(@Body() body: resetpass) {
        return await this.userService.startResetPass(body);
    }

    @Post('user-check-password')
    async checkPassword(@Body() body: { email: string; password: string }) {
    return await this.userService.checkPassword(body);
    }

    @Post('verify-password')
    async verifyPassword(@Body() body){
        console.log('hello')
        return await this.userService.verifyPassword(body)
    }

    @Post('user-add-profile')
    @UseGuards(AuthGuard('jwt'))
    @Roles('superAdmin', 'companyAdmin', 'warehouseAdmin')
    async addProfile(@Body() body: { userId: number; groupId: number; companyId: number; isActive: string }) {
        const result = await this.userService.addProfile(body);
        return { encrypted: encryptResponse(result) };
    }
}