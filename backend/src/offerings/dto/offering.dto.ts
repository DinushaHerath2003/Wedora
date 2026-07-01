import { IsString, IsNumber, IsOptional, IsArray, IsBoolean } from 'class-validator';

export class CreateOfferingDto {
  @IsString()
  name!: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsString()
  category!: string;

  @IsOptional()
  @IsString()
  serviceType?: string;

  @IsNumber()
  price!: number;

  @IsOptional()
  @IsArray()
  facilities?: string[];

  @IsOptional()
  @IsString()
  roomType?: string;

  @IsOptional()
  @IsNumber()
  stock?: number;

  @IsOptional()
  @IsString()
  discount?: string;

  @IsOptional()
  @IsString()
  discountType?: string;

  @IsOptional()
  @IsArray()
  images?: string[];

  @IsOptional()
  @IsBoolean()
  isDraft?: boolean;

  @IsNumber()
  vendorId!: number;
}

export class UpdateOfferingDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  @IsString()
  serviceType?: string;

  @IsOptional()
  @IsNumber()
  price?: number;

  @IsOptional()
  @IsArray()
  facilities?: string[];

  @IsOptional()
  @IsString()
  roomType?: string;

  @IsOptional()
  @IsNumber()
  stock?: number;

  @IsOptional()
  @IsString()
  discount?: string;

  @IsOptional()
  @IsString()
  discountType?: string;

  @IsOptional()
  @IsArray()
  images?: string[];

  @IsOptional()
  @IsBoolean()
  isDraft?: boolean;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
