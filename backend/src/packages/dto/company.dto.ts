import { Transform, Type } from "class-transformer";
import { IsEmail, IsEnum, IsInt, IsNotEmpty, IsNumber, IsOptional, IsString, Length, ValidateNested } from "class-validator";

export enum isStatus {
    ACTIVE = "active",
    INACTIVE = "inactive",
    PENDING = "pending",
    BLOCK = "block"
}

export class CompanyDto {
    @IsString()
    @Length(2, 100)
    companyName!: string;

    @IsString()
    @Length(2, 20)
    companyCode!: string;

    @IsString()
    @IsEnum(isStatus)
    status!: string;

    @IsOptional()
    @IsString()
    @Length(2, 100)
    companyLocation?: string;

    @IsOptional()
    @IsEmail()
    email?: string;

    @IsOptional()
    @IsString()
    website?: string;

    @IsOptional()
    @IsNumber()
    @Transform(({ value }) => Number(value))
    dialCode?: number;

    @IsOptional()
    @IsString()
    phone?: number;

    @IsOptional()
    @IsString()
    country?: string;

    @IsOptional()
    @IsString()
    state?: string;

    @IsOptional()
    @IsNumber()
    @Transform(({ value }) => Number(value))
    postalCode?: number;

    @IsOptional()
    @IsString()
    AddressLineOne?: string;

    @IsOptional()
    @IsString()
    ownerName?: string;

    @IsOptional()
    @IsEmail()
    ownerEmail?: string;

    @IsOptional()
    @IsString()
    ownerPhone?: string;

    @IsOptional()
    companyFile: any;
}

export class CompanyUpdateDto {
    @IsInt()
    @IsNotEmpty()
    @Transform(({ value }) => Number(value))
    companyId!: number;

    @IsOptional()
    @IsString()
    @Length(2, 100)
    companyName?: string;

    @IsOptional()
    @IsString()
    @Length(2, 20)
    companyCode?: string;

    @IsOptional()
    @IsString()
    @Length(2, 100)
    companyLocation?: string;

    @IsOptional()
    @IsString()
    @IsEnum(isStatus)
    status?: string;

    @IsOptional()
    @IsEmail()
    email?: string;

    @IsOptional()
    @IsString()
    website?: string;

    @IsOptional()
    @IsNumber()
    @Transform(({ value }) => Number(value))
    dialCode?: number;

    @IsOptional()
    @IsNumber()
    @Transform(({ value }) => Number(value))
    phone?: number;

    @IsOptional()
    @IsString()
    country?: string;

    @IsOptional()
    @IsString()
    state?: string;

    @IsOptional()
    @IsNumber()
    @Transform(({ value }) => Number(value))
    postalCode?: number;

    @IsOptional()
    @IsString()
    AddressLineOne?: string;

    @IsOptional()
    @IsString()
    ownerName?: string;

    @IsOptional()
    @IsEmail()
    ownerEmail?: string;

    @IsOptional()
    @IsString()
    ownerPhone?: string;

    @IsOptional()
    companyFile: any;
}

export class getCompanyListDto {
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