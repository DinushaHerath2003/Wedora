import { Injectable, ConflictException, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Vendor } from './entities/vendor.entity';
import { VendorSignupDto, VendorLoginDto, VendorAuthResponseDto } from './dto/vendor-auth.dto';
import { UserRole } from '../common/constants';
import { JwtPayload } from '../common/auth/jwt-payload.type';

@Injectable()
export class VendorAuthService {
  constructor(
    @InjectRepository(Vendor)
    private vendorRepository: Repository<Vendor>,
    private readonly jwtService: JwtService,
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

    return {
      accessToken: this.generateAccessToken(savedVendor),
      user: this.toAuthUser(savedVendor),
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

    return {
      accessToken: this.generateAccessToken(vendor),
      user: this.toAuthUser(vendor),
    };
  }

  private generateAccessToken(vendor: Vendor): string {
    const payload: JwtPayload = {
      sub: vendor.id,
      email: vendor.email,
      role: UserRole.VENDOR,
    };

    return this.jwtService.sign(payload);
  }

  private toAuthUser(vendor: Vendor) {
    return {
      id: vendor.id,
      email: vendor.email,
      role: UserRole.VENDOR,
      organizationName: vendor.organizationName,
      phone: vendor.phone,
      location: vendor.location,
      categories: vendor.categories,
      contactPerson: vendor.contactPerson,
      isActive: vendor.isActive,
      createdAt: vendor.createdAt,
    };
  }
}
