import { IsString, IsOptional, IsBoolean, IsEnum, IsEmail, IsArray } from 'class-validator';
import { UserRole } from '../../common/constants';

export class AdminUpdateUserDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  password?: string;

  @IsOptional()
  @IsEnum(UserRole)
  role?: UserRole;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class AdminUpdateVendorDto {
  @IsOptional()
  @IsString()
  organizationName?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  location?: string;

  @IsOptional()
  @IsArray()
  categories?: string[];

  @IsOptional()
  @IsString()
  contactPerson?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
