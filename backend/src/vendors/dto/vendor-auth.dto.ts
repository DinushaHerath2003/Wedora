import { IsEmail, IsString, MinLength, IsArray, IsOptional } from 'class-validator';

export class VendorSignupDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6)
  password: string;

  @IsString()
  organizationName: string;

  @IsString()
  phone: string;

  @IsString()
  location: string;

  @IsArray()
  categories: string[];

  @IsOptional()
  @IsString()
  contactPerson?: string;
}

export class VendorLoginDto {
  @IsEmail()
  email: string;

  @IsString()
  password: string;
}

export class VendorAuthResponseDto {
  accessToken: string;
  user: {
    id: number;
    email: string;
    role: string;
    organizationName: string;
    phone: string;
    location: string;
    categories: string[];
    contactPerson?: string;
    isActive: boolean;
    createdAt: Date;
  };
}
