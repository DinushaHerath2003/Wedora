import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VendorsController } from './vendors.controller';
import { VendorsService } from './vendors.service';
import { VendorAuthService } from './vendor-auth.service';
import { Vendor } from './entities/vendor.entity';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [TypeOrmModule.forFeature([Vendor]), AuthModule],
  controllers: [VendorsController],
  providers: [VendorsService, VendorAuthService],
  exports: [VendorsService, VendorAuthService],
})
export class VendorsModule {}
