import { IsString, IsNumber, IsDate, IsOptional, IsEnum } from 'class-validator';
import { BookingStatus } from '../entities/booking.entity';

export class CreateBookingDto {
  @IsString()
  userId: string;

  @IsNumber()
  offeringId: number;

  @IsNumber()
  vendorId: number;

  @IsDate()
  eventDate: Date;

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
  @IsDate()
  eventDate?: Date;

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
