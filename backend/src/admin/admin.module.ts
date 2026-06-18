import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../users/entities/user.entity';
import { Vendor } from '../vendors/entities/vendor.entity';
import { Booking } from '../bookings/entities/booking.entity';
import { ContactsModule } from '../contacts/contacts.module';
import { AdminService } from './admin.service';
import { AdminController } from './admin.controller';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Vendor, Booking]),
    ContactsModule,
    AuthModule,
  ],
  controllers: [AdminController],
  providers: [AdminService],
})
export class AdminModule {}













/*he AdminModule is a NestJS feature module that groups admin functionality. It integrates TypeORM entities like User, Vendor, and Booking, imports Auth and Contacts modules for authentication and messaging, and provides AdminController and AdminService to handle admin operations in a modular and scalable architecture.*/