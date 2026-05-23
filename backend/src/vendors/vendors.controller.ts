import { Controller, Get, Post, Body, Param, Put, Delete } from '@nestjs/common';
import { VendorsService } from './vendors.service';
import { VendorAuthService } from './vendor-auth.service';
import { CreateVendorDto, UpdateVendorDto } from './dto/vendor.dto';
import { VendorSignupDto, VendorLoginDto } from './dto/vendor-auth.dto';

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
  update(@Param('id') id: string, @Body() updateVendorDto: UpdateVendorDto) {
    return this.vendorsService.update(+id, updateVendorDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.vendorsService.remove(+id);
  }
}
