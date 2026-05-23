import { Injectable, ConflictException, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Vendor } from './entities/vendor.entity';
import { VendorSignupDto, VendorLoginDto, VendorAuthResponseDto } from './dto/vendor-auth.dto';

@Injectable()
export class VendorAuthService {
  constructor(
    @InjectRepository(Vendor)
    private vendorRepository: Repository<Vendor>,
  ) {}

  async signup(signupDto: VendorSignupDto): Promise<VendorAuthResponseDto> {
    const { email, password, organizationName, phone, location, categories, contactPerson } = signupDto;

    // Check if vendor already exists
    const existingVendor = await this.vendorRepository.findOne({ where: { email } });
    if (existingVendor) {
      throw new ConflictException('Vendor with this email already exists');
    }

    // Validate required fields
    if (!organizationName || !phone || !location || !categories || categories.length === 0) {
      throw new BadRequestException('Organization name, phone, location, and at least one category are required');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create vendor
    const vendor = this.vendorRepository.create({
      email,
      password: hashedPassword,
      organizationName,
      phone,
      location,
      categories,
      contactPerson,
      isActive: true,
    });

    const savedVendor = await this.vendorRepository.save(vendor);

    // Generate a simple token
    const accessToken = Buffer.from(`${savedVendor.id}:${Date.now()}`).toString('base64');

    return {
      id: savedVendor.id,
      email: savedVendor.email,
      role: 'vendor',
      organizationName: savedVendor.organizationName,
      phone: savedVendor.phone,
      location: savedVendor.location,
      categories: savedVendor.categories,
      contactPerson: savedVendor.contactPerson,
      isActive: savedVendor.isActive,
      createdAt: savedVendor.createdAt,
      accessToken,
    };
  }

  async login(loginDto: VendorLoginDto): Promise<VendorAuthResponseDto> {
    const { email, password } = loginDto;

    // Find vendor by email
    const vendor = await this.vendorRepository.findOne({ where: { email } });
    if (!vendor) {
      throw new UnauthorizedException('Invalid email or password');
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, vendor.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid email or password');
    }

    if (!vendor.isActive) {
      throw new UnauthorizedException('Vendor account is inactive');
    }

    // Generate a simple token
    const accessToken = Buffer.from(`${vendor.id}:${Date.now()}`).toString('base64');

    return {
      id: vendor.id,
      email: vendor.email,
      role: 'vendor',
      organizationName: vendor.organizationName,
      phone: vendor.phone,
      location: vendor.location,
      categories: vendor.categories,
      contactPerson: vendor.contactPerson,
      isActive: vendor.isActive,
      createdAt: vendor.createdAt,
      accessToken,
    };
  }
}
