import { IsString, IsNumber, IsOptional } from 'class-validator';

export class CreateReviewDto {
  @IsString()
  userId: string;

  @IsNumber()
  offeringId: number;

  @IsNumber()
  vendorId: number;

  @IsNumber()
  rating: number;

  @IsOptional()
  @IsString()
  comment?: string;
}

export class UpdateReviewDto {
  @IsOptional()
  @IsNumber()
  rating?: number;

  @IsOptional()
  @IsString()
  comment?: string;
}
