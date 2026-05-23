import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Vendor } from './entities/vendor.entity';
import { CreateVendorDto, UpdateVendorDto } from './dto/vendor.dto';

@Injectable()
export class VendorsService {
  constructor(
    @InjectRepository(Vendor)
    private vendorRepository: Repository<Vendor>,
  ) {}

  async create(createVendorDto: CreateVendorDto): Promise<Vendor> {
    const vendor = this.vendorRepository.create(createVendorDto);
    return this.vendorRepository.save(vendor);
  }

  async findAll(): Promise<Vendor[]> {
    return this.vendorRepository.find({ relations: ['offerings'] });
  }

  async findOne(id: number): Promise<Vendor | null> {
    return this.vendorRepository.findOne({
      where: { id },
      relations: ['offerings', 'bookings', 'reviews'],
    });
  }

  async update(id: number, updateVendorDto: UpdateVendorDto): Promise<Vendor | null> {
    await this.vendorRepository.update(id, updateVendorDto);
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    await this.vendorRepository.delete(id);
  }
}
