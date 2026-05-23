import { IsEmail, IsNotEmpty, IsString, MinLength, IsEnum, IsOptional, IsArray } from 'class-validator';
import { UserRole } from '../../common/constants';

export class SignupDto {
  @IsEnum(UserRole)
  @IsNotEmpty()
  role: UserRole;

  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @MinLength(6)
  @IsNotEmpty()
  password: string;

  // For User and Admin
  @IsString()
  @IsOptional()
  name?: string;

  // For Vendor
  @IsString()
  @IsOptional()
  organizationName?: string;

  @IsString()
  @IsOptional()
  location?: string;

  @IsArray()
  @IsOptional()
  categories?: string[];
}

export class LoginDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  password: string;
}
