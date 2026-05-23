import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ServiceOffering } from './entities/offering.entity';
import { CreateOfferingDto, UpdateOfferingDto } from './dto/offering.dto';

@Injectable()
export class OfferingsService {
  constructor(
    @InjectRepository(ServiceOffering)
    private offeringRepository: Repository<ServiceOffering>,
  ) {}

  async create(createOfferingDto: CreateOfferingDto): Promise<ServiceOffering> {
    const offering = this.offeringRepository.create(createOfferingDto);
    return this.offeringRepository.save(offering);
  }

  async findAll(): Promise<ServiceOffering[]> {
    return this.offeringRepository.find({ relations: ['vendor'] });
  }

  async findByVendor(vendorId: number): Promise<ServiceOffering[]> {
    return this.offeringRepository.find({
      where: { vendorId },
      relations: ['vendor'],
    });
  }

  async findOne(id: number): Promise<ServiceOffering | null> {
    return this.offeringRepository.findOne({
      where: { id },
      relations: ['vendor', 'bookings', 'reviews'],
    });
  }

  async update(id: number, updateOfferingDto: UpdateOfferingDto): Promise<ServiceOffering | null> {
    await this.offeringRepository.update(id, updateOfferingDto);
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    await this.offeringRepository.delete(id);
  }
}
