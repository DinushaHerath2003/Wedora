import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Booking, BookingStatus } from './entities/booking.entity';
import { CreateBookingDto, UpdateBookingDto } from './dto/booking.dto';

@Injectable()
export class BookingsService {
  constructor(
    @InjectRepository(Booking)
    private bookingRepository: Repository<Booking>,
  ) {}

  async create(createBookingDto: CreateBookingDto): Promise<Booking> {
    const booking = this.bookingRepository.create({
      userId: createBookingDto.userId ?? null,
      offeringId: createBookingDto.offeringId,
      vendorId: createBookingDto.vendorId,
      eventDate: new Date(createBookingDto.eventDate),
      eventTime: createBookingDto.eventTime ?? null,
      clientName: createBookingDto.clientName ?? null,
      clientEmail: createBookingDto.clientEmail ?? null,
      clientPhone: createBookingDto.clientPhone ?? null,
      guestCount: createBookingDto.guestCount,
      budget: createBookingDto.budget,
      notes: createBookingDto.notes,
    });
    return this.bookingRepository.save(booking);
  }

  async findAll(): Promise<Booking[]> {
    return this.bookingRepository.find({ relations: ['user', 'offering', 'vendor'] });
  }

  async findByUser(userId: string): Promise<Booking[]> {
    // Cast userId to match the field type
    const query = this.bookingRepository.createQueryBuilder('booking')
      .where('booking.userId = :userId', { userId })
      .leftJoinAndSelect('booking.offering', 'offering')
      .leftJoinAndSelect('booking.vendor', 'vendor');
    return query.getMany();
  }

  async findByVendor(vendorId: number): Promise<Booking[]> {
    return this.bookingRepository.find({
      where: { vendorId },
      relations: ['user', 'offering'],
    });
  }

  async findOne(id: number): Promise<Booking | null> {
    return this.bookingRepository.findOne({
      where: { id },
      relations: ['user', 'offering', 'vendor'],
    });
  }

  async update(id: number, updateBookingDto: UpdateBookingDto): Promise<Booking | null> {
    const payload: Partial<UpdateBookingDto> = { ...updateBookingDto };
    if (payload.eventDate) {
      payload.eventDate = new Date(payload.eventDate) as any;
    }
    await this.bookingRepository.update(id, payload);
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    await this.bookingRepository.delete(id);
  }
}
