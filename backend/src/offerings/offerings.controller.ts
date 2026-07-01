import { Body, Controller, Delete, Get, Param, Post, Put, Query, UseGuards, ValidationPipe } from '@nestjs/common';
import { OfferingsService } from './offerings.service';
import { CreateOfferingDto, UpdateOfferingDto } from './dto/offering.dto';
import { Roles } from '../common/auth/roles.decorator';
import { UserRole } from '../common/constants';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';

@Controller('offerings')
export class OfferingsController {
  constructor(private offeringsService: OfferingsService) {}

  @Post()
  @Roles(UserRole.VENDOR)
  @UseGuards(JwtAuthGuard, RolesGuard)
  create(@Body(ValidationPipe) createOfferingDto: CreateOfferingDto) {
    return this.offeringsService.create(createOfferingDto);
  }

  @Get()
  findAll(@Query('vendorId') vendorId?: string, @Query('serviceType') serviceType?: string) {
    if (vendorId) {
      return this.offeringsService.findByVendor(+vendorId, serviceType);
    }
    return this.offeringsService.findAll(serviceType);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.offeringsService.findOne(+id);
  }

  @Put(':id')
  @Roles(UserRole.VENDOR)
  @UseGuards(JwtAuthGuard, RolesGuard)
  update(@Param('id') id: string, @Body(ValidationPipe) updateOfferingDto: UpdateOfferingDto) {
    return this.offeringsService.update(+id, updateOfferingDto);
  }

  @Delete(':id')
  @Roles(UserRole.VENDOR)
  @UseGuards(JwtAuthGuard, RolesGuard)
  remove(@Param('id') id: string) {
    return this.offeringsService.remove(+id);
  }
}
