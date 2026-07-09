import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from 'src/utilities/roles.guard';
import { ActivityService } from './activity.service';
import { GetActivityListDto } from 'src/packages/dto/activity.dto';
import { encryptResponse } from 'src/utilities/crypto';

@Controller('activity')
export class ActivityController {
    constructor(private readonly activityService: ActivityService) {}

    @Post('list')
    @UseGuards(AuthGuard('jwt'), RolesGuard)
    async listLogs(@Req() req: any, @Body() body: GetActivityListDto) {
        const result = await this.activityService.listLogs(body, req);
        return {
            encrypted: encryptResponse(result),
        };
    }
}

