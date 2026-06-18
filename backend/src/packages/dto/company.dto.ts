import { Transform, Type } from "class-transformer";
import { IsEmail, IsEnum, IsIn, IsInt, IsNotEmpty, IsNumber, IsOptional, IsString, Length, Min, ValidateNested } from "class-validator";
import { EntitySchemaOptions } from "typeorm";

export enum isOptional {
    YES = "yes",
    NO = "no"
}
export enum isStatus{
    ACTIVE="active",
    INACTIVE="inactive",
    PENDING="pending",
    BLOCK="block"
}

export class CompanyDto{
    @IsString()
    @Length(2, 20)
    companyName!: string;

    @IsString()
    @Length(2, 20)
    companyCode!: string;

    @IsString()
    @IsEnum(isStatus)
    status!: string;


    @IsString()
    @Length(2, 50)
    companyLocation!: string;

    @IsOptional()
    companyFile: any;

}

export class CompanyUpdateDto {

    @IsInt()
    @IsNotEmpty()
    companyId!:number;

    @IsNotEmpty()
    @IsString()
    @Length(2, 20)
    companyName!: string;

    @IsOptional()
    @IsString()
    @Length(2, 20)
    companyCode!: string;


    @IsString()
    @Length(2, 50)
    companyLocation!: string;

    @IsOptional()
    @IsString()
    @IsEnum(isStatus)
    status!: string;

    @IsOptional()
    companyFile: any;
}



export class getCompanyListDto{
    @IsOptional()
    @IsInt()
    @Transform(({ value }) => Number(value))
    page!: number;

    @IsOptional()
    @IsInt()
    @Transform(({ value }) => Number(value))
    limit!: number;
    
    @IsOptional()
  @ValidateNested()
  @Type(() => filterDto)
  filters: any;
}

export class filterDto {

    @IsString()
  @IsNotEmpty()
  key!: string;

  @IsNotEmpty()
  value!: string;

  @IsString()
  @IsNotEmpty()
  operator!: string;
}

