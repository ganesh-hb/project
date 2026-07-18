import { Body, Controller, Get, Param, Post, Put, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { PermissionsGuard, RequirePermission } from 'src/utilities/permissions.guard';
import { CurrencyService } from './currency.service';
import { getCurrencyListDto, CurrencyDto, CurrencyUpdateDto } from 'src/packages/dto/currency.dto';
import { encryptResponse } from 'src/utilities/crypto';

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

  @Post('currency-add')
  @UseGuards(AuthGuard('jwt'), PermissionsGuard)
  @RequirePermission('currencyAdd')
  async insertCurrency(@Req() req, @Body() body: CurrencyDto) {
    const result = await this.currencyService.insertCurrency(body, req);
    return { encrypted: encryptResponse(result) };
  }

  @Put('currency-update')
  @UseGuards(AuthGuard('jwt'), PermissionsGuard)
  @RequirePermission('currencyUpdate')
  async updateCurrency(@Req() req, @Body() body: CurrencyUpdateDto) {
    const result = await this.currencyService.updateCurrency(body, req);
    return { encrypted: encryptResponse(result) };
  }

  @Put('sync-currency-conversion')
  @UseGuards(AuthGuard('jwt'), PermissionsGuard)
  @RequirePermission('currencyList')
   async syncCurrency(@Req() req, @Body() body: getCurrencyListDto) {
    return await this.currencyService.syncCurrency(body, req);
  }
}

