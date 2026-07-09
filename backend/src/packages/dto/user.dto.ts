import { Transform, Type } from 'class-transformer';
import {
    IsEmail,
    IsEnum,
    IsInt,
    IsNotEmpty,
    IsNumber,
    IsOptional,
    IsString,
    Length,
    Min,
    ValidateNested,
    Matches,
} from 'class-validator';

export enum isOptional {
    true = 'true',
    false = 'false',
}

export enum isStatus {
    ACTIVE = 'Active',
    INACTIVE = 'Inactive',
    PENDING = 'Pending',
    BLOCK = 'Block',
}

export enum isRole {
    COMPANY_ADMIN = 'companyAdmin',
    WAREHOUSE_ADMIN = 'warehouseAdmin',
    USER = 'user',
}

export class UserDto {
    @IsString()
    @Length(2, 20)
    @Matches(/^[A-Za-z0-9_]+$/ , { message: 'Username can only contain letters, numbers, and underscores' })
    name!: string;

    @IsOptional()
    @IsString()
    @Length(1, 50)
    firstName?: string;

    @IsOptional()
    @IsString()
    @Length(0, 50)
    middleName?: string;

    @IsOptional()
    @IsString()
    @Length(1, 50)
    surname?: string;
    
    @IsEmail()
    email!: string;

    @IsInt()
    @Min(18)
    @Transform(({ value }) => Number(value))
    age!: number;

    @IsString()
    @IsEnum(isStatus)
    status!: string;

    @IsString()
    @IsNotEmpty()
    @Length(10)
    phone!: string;

    @IsNotEmpty()
    @IsString()
    password!: string;

    @IsOptional()
    userFile: any;

    @IsOptional()
    dialCode: any;

    @IsOptional()
    @Transform(({ value }) => Number(value))
    createdBy!: number;

    @IsOptional()
    @Transform(({ value }) => Number(value))
    updatedBy!: number;

    @IsOptional()
    @IsInt()
    @IsNotEmpty()
    @Transform(({ value }) => Number(value))
    groupId!: number;

    @IsOptional()
    @IsInt()
    @IsNotEmpty()
    @Transform(({ value }) => Number(value))
    companyId!: number;

    @IsOptional()
    @IsInt()
    @Transform(({ value }) => Number(value))
    is_parent?: number;
}

export class userUpdateDto {
    @IsNumber()
    @IsNotEmpty()
    @Transform(({ value }) => Number(value))
    userId!: number;

    @IsOptional()
    @IsString()
    @Length(3, 20)
    @Matches(/^[A-Za-z0-9_]+$/ , { message: 'Username can only contain letters, numbers, and underscores' })
    userName?: string; // immutable

    @IsOptional()
    @IsEmail()
    email?: string; // immutable

    @IsOptional()
    @IsString()
    @Length(1, 50)
    firstName?: string;

    @IsOptional()
    @IsString()
    @Length(0, 50)
    middleName?: string;

    @IsOptional()
    @IsString()
    @Length(1, 50)
    surname?: string;

    @IsOptional()
    @IsInt()
    @Min(18)
    @Transform(({ value }) => Number(value))
    age!: number;

    @IsOptional()
    @IsString()
    @IsEnum(isStatus)
    status!: string;

    @IsOptional()
    @IsString()
    @Length(10)
    phone!: string;

    @IsOptional()
    userFile!: string;

    @IsOptional()
    @Transform(({ value }) => Number(value))
    createdBy!: number;

    @IsOptional()
    @Transform(({ value }) => Number(value))
    updatedBy!: number;

    @IsOptional()
    @IsInt()
    @IsNotEmpty()
    @Transform(({ value }) => Number(value))
    groupId!: number;

    @IsOptional()
    @IsInt()
    @IsNotEmpty()
    @Transform(({ value }) => Number(value))
    companyId!: number;

    @IsOptional()
    @IsInt()
    @Transform(({ value }) => Number(value))
    is_parent?: number;

}

export class UserPassDto {
    @IsEmail()
    email!: string;

    @IsNotEmpty()
    @IsString()
    password!: string;

    @IsNotEmpty()
    @IsString()
    newuserpass!: string;
}

export class login {
    // Either email or userName can be used for login. Both are optional but at least one must be provided.
    @IsOptional()
    @IsEmail()
    email?: string;

    @IsOptional()
    @IsString()
    @IsNotEmpty({ message: 'Username cannot be empty' })
    userName?: string;

    @IsNotEmpty()
    @IsString()
    password!: string;
}

export class forgotPass {
    @IsEmail()
    @IsNotEmpty()
    email!: string;
}

export class confirmOtp {
    @IsNumber()
    @IsNotEmpty()
    @Transform(({ value }) => Number(value))
    otp!: number;
}

export class resetpass {
    @IsString()
    @IsNotEmpty()
    token!: number;

    @IsString()
    @IsNotEmpty()
    password!: number;

    @IsString()
    @IsNotEmpty()
    confirmPass!: number;
}

export class changePass {
    @IsEmail()
    email!: string;

    @IsString()
    @IsNotEmpty()
    password!: number;

    @IsString()
    @IsNotEmpty()
    confirmpass!: number;

    @IsString()
    @IsNotEmpty()
    newpass!: number;
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

export class getUserListDto {
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