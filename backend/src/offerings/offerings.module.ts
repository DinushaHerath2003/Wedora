import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OfferingsController } from './offerings.controller';
import { OfferingsService } from './offerings.service';
import { ServiceOffering } from './entities/offering.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ServiceOffering])],
  controllers: [OfferingsController],
  providers: [OfferingsService],
  exports: [OfferingsService],
})
export class OfferingsModule {}
