import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ServiceOffering } from './entities/offering.entity';
import { CreateOfferingDto, UpdateOfferingDto } from './dto/offering.dto';
import { Vendor } from '../vendors/entities/vendor.entity';

@Injectable()
export class OfferingsService {
  constructor(
    @InjectRepository(ServiceOffering)
    private offeringRepository: Repository<ServiceOffering>,
    @InjectRepository(Vendor)
    private vendorRepository: Repository<Vendor>,
  ) {}

  async create(createOfferingDto: CreateOfferingDto): Promise<ServiceOffering> {
    const vendor = await this.vendorRepository.findOne({
      where: { id: createOfferingDto.vendorId },
    });

    if (!vendor) {
      throw new BadRequestException('Invalid vendorId: vendor not found');
    }

    const offering = this.offeringRepository.create(createOfferingDto);
    offering.vendor = vendor;
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
