import { IsString, IsNumber, IsOptional, IsEnum } from 'class-validator';
import { Transform } from 'class-transformer';
import { BookingStatus } from '../entities/booking.entity';

export class CreateBookingDto {
  @IsOptional()
  @Transform(({ value }) => (value === undefined || value === null ? value : String(value)))
  @IsString()
  userId?: string;

  @IsNumber()
  offeringId!: number;

  @IsNumber()
  vendorId!: number;

  @IsString()
  eventDate!: string;

  @IsString()
  eventTime!: string;

  @IsOptional()
  @IsString()
  clientName?: string;

  @IsOptional()
  @IsString()
  clientEmail?: string;

  @IsOptional()
  @IsString()
  clientPhone?: string;

  @IsOptional()
  @IsNumber()
  guestCount?: number;

  @IsOptional()
  @IsNumber()
  budget?: number;

  @IsOptional()
  @IsString()
  notes?: string;
}

export class UpdateBookingDto {
  @IsOptional()
  @IsString()
  eventDate?: string;

  @IsOptional()
  @IsString()
  eventTime?: string;

  @IsOptional()
  @IsString()
  clientName?: string;

  @IsOptional()
  @IsString()
  clientEmail?: string;

  @IsOptional()
  @IsString()
  clientPhone?: string;

  @IsOptional()
  @IsNumber()
  guestCount?: number;

  @IsOptional()
  @IsNumber()
  budget?: number;

  @IsOptional()
  @IsEnum(BookingStatus)
  status?: BookingStatus;

  @IsOptional()
  @IsString()
  notes?: string;
}
