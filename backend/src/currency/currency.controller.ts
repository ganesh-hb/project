import { Body, Controller, Get, Param, Post, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { PermissionsGuard, RequirePermission } from 'src/utilities/permissions.guard';
import { CurrencyService } from './currency.service';
import { getCurrencyListDto } from 'src/packages/dto/currency.dto';

@Controller('currency')
export class CurrencyController {
  constructor(private readonly currencyService: CurrencyService) {}

  @Post('currency-list')
  @UseGuards(AuthGuard('jwt'), PermissionsGuard)
  @RequirePermission('currencyList')
  async getCurrencies(@Req() req, @Body() body: getCurrencyListDto) {
    return await this.currencyService.getCurrencies(body, req);
  }

  @Get('currency-details/:id')
  @UseGuards(AuthGuard('jwt'), PermissionsGuard)
  @RequirePermission('currencyView')
  async getCurrency(@Req() req, @Param('id') id: string) {
    return await this.currencyService.getCurrencyDetails(Number(id), req);
  }
}
