import { Controller, Get, Post, Body, Param, Put, Delete, Query, ValidationPipe } from '@nestjs/common';
import { OfferingsService } from './offerings.service';
import { CreateOfferingDto, UpdateOfferingDto } from './dto/offering.dto';

@Controller('offerings')
export class OfferingsController {
  constructor(private offeringsService: OfferingsService) {}

  @Post()
  create(@Body(ValidationPipe) createOfferingDto: CreateOfferingDto) {
    return this.offeringsService.create(createOfferingDto);
  }

  @Get()
  findAll(@Query('vendorId') vendorId?: string) {
    if (vendorId) {
      return this.offeringsService.findByVendor(+vendorId);
    }
    return this.offeringsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.offeringsService.findOne(+id);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body(ValidationPipe) updateOfferingDto: UpdateOfferingDto) {
    return this.offeringsService.update(+id, updateOfferingDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.offeringsService.remove(+id);
  }
}
