import { Transform, Type } from 'class-transformer';
import { IsInt, IsOptional, IsString, ValidateNested } from 'class-validator';

export class ActivityFilterDto {
  @IsString()
  key!: string;

  @IsString()
  value!: string;

  @IsString()
  operator!: string;
}

export class GetActivityListDto {
  @IsOptional()
  @IsInt()
  @Transform(({ value }) => Number(value))
  page?: number;

  @IsOptional()
  @IsInt()
  @Transform(({ value }) => Number(value))
  limit?: number;

  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => ActivityFilterDto)
  filters?: ActivityFilterDto[];

  // Date-range filter (inclusive), expected as 'YYYY-MM-DD' strings from the
  // react-date-range picker on the frontend.
  @IsOptional()
  @IsString()
  startDate?: string;

  @IsOptional()
  @IsString()
  endDate?: string;
}
