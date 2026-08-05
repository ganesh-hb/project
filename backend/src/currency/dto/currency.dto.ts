import { Transform, Type } from 'class-transformer';
import {
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateNested,
  IsNumber,
  IsIn,
  Length,
} from 'class-validator';

export class CurrencyFilterDto {
  @IsString()
  @IsNotEmpty()
  key!: string;

  @IsNotEmpty()
  value!: any;

  @IsString()
  @IsNotEmpty()
  operator!: string;
}

export class getCurrencyListDto {
  @IsOptional()
  @IsInt()
  @Transform(({ value }) => Number(value))
  page!: number;

  @IsOptional()
  @IsInt()
  @Transform(({ value }) => Number(value))
  limit!: number;

  @IsOptional()
  @IsString()
  condition?: string;

  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => CurrencyFilterDto)
  filters?: CurrencyFilterDto[];
}

export class CurrencyDto {
  @IsString()
  @IsNotEmpty()
  @Length(2, 255)
  name!: string;

  @IsString()
  @IsNotEmpty()
  @Length(2, 255)
  code!: string;

  @IsString()
  @IsNotEmpty()
  @Length(1, 10)
  symbol!: string;

  @IsNumber()
  @IsNotEmpty()
  @Transform(({ value }) => Number(value))
  conversionRate!: number;

  @IsString()
  @IsNotEmpty()
  @IsIn(['Active', 'Inactive'])
  status!: 'Active' | 'Inactive';

  @IsOptional()
  @IsInt()
  @Transform(({ value }) => Number(value))
  addedBy?: number;

  @IsOptional()
  @IsInt()
  @Transform(({ value }) => Number(value))
  updatedBy?: number;
}

export class CurrencyUpdateDto {
  @IsInt()
  @IsNotEmpty()
  @Transform(({ value }) => Number(value))
  curId!: number;

  @IsOptional()
  @IsString()
  @Length(2, 255)
  name?: string;

  @IsOptional()
  @IsString()
  @Length(2, 255)
  code?: string;

  @IsOptional()
  @IsString()
  @Length(1, 10)
  symbol?: string;

  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => Number(value))
  conversionRate?: number;

  @IsOptional()
  @IsString()
  @IsIn(['Active', 'Inactive'])
  status?: 'Active' | 'Inactive';

  @IsOptional()
  @IsInt()
  @Transform(({ value }) => Number(value))
  updatedBy?: number;
}

