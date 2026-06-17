import { Body, Controller, Delete, Get, Param, Post, Put, UseGuards } from '@nestjs/common';
import { VendorsService } from './vendors.service';
import { VendorAuthService } from './vendor-auth.service';
import { CreateVendorDto, UpdateVendorDto } from './dto/vendor.dto';
import { VendorSignupDto, VendorLoginDto } from './dto/vendor-auth.dto';
import { Roles } from '../common/auth/roles.decorator';
import { UserRole } from '../common/constants';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';

@Controller('vendors')
export class VendorsController {
  constructor(
    private vendorsService: VendorsService,
    private vendorAuthService: VendorAuthService,
  ) {}

  @Post('auth/signup')
  signup(@Body() signupDto: VendorSignupDto) {
    return this.vendorAuthService.signup(signupDto);
  }

  @Post('auth/login')
  login(@Body() loginDto: VendorLoginDto) {
    return this.vendorAuthService.login(loginDto);
  }

  @Post()
  @Roles(UserRole.VENDOR)
  @UseGuards(JwtAuthGuard, RolesGuard)
  create(@Body() createVendorDto: CreateVendorDto) {
    return this.vendorsService.create(createVendorDto);
  }

  @Get()
  findAll() {
    return this.vendorsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.vendorsService.findOne(+id);
  }

  @Put(':id')
  @Roles(UserRole.VENDOR)
  @UseGuards(JwtAuthGuard, RolesGuard)
  update(@Param('id') id: string, @Body() updateVendorDto: UpdateVendorDto) {
    return this.vendorsService.update(+id, updateVendorDto);
  }

  @Delete(':id')
  @Roles(UserRole.VENDOR)
  @UseGuards(JwtAuthGuard, RolesGuard)
  remove(@Param('id') id: string) {
    return this.vendorsService.remove(+id);
  }
}
