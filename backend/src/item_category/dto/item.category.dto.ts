import { Transform, Type } from 'class-transformer';
import {
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateNested,
  IsIn,
} from 'class-validator';

export class filterDto {
  @IsString()
  @IsNotEmpty()
  key!: string;

  @IsNotEmpty()
  value!: any;

  @IsString()
  @IsNotEmpty()
  operator!: string;
}

export class categoryListDto {
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
  @Type(() => filterDto)
  filters?: filterDto[];
}

export class ItemCategoryDto {
  @IsString()
  @IsNotEmpty()
  itemCategoryName!: string;

  @IsIn(['Goods', 'Service'])
  type!: 'Goods' | 'Service';

  @IsInt()
  @IsNotEmpty()
  @Transform(({ value }) => Number(value))
  companyId!: number;

  @IsString()
  @IsNotEmpty()
  @IsIn(['Active', 'Inactive'])
  status!: 'Active' | 'Inactive';

  @IsOptional()
  @IsInt()
  @Transform(({ value }) => Number(value))
  addedBy?: number;
}

export class ItemCategoryUpdateDto {
  @IsInt()
  @IsNotEmpty()
  @Transform(({ value }) => Number(value))
  itemCategoryId!: number;

  @IsOptional()
  @IsString()
  itemCategoryName?: string;

  @IsOptional()
  @IsString()
  @IsIn(['Goods', 'Service'])
  type?: 'Goods' | 'Service';

  @IsOptional()
  @IsString()
  @IsIn(['Active', 'Inactive'])
  status?: 'Active' | 'Inactive';

  @IsOptional()
  @IsInt()
  @Transform(({ value }) => Number(value))
  updatedBy?: number;
}