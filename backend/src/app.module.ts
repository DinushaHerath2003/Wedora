import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { VendorsModule } from './vendors/vendors.module';
import { OfferingsModule } from './offerings/offerings.module';
import { BookingsModule } from './bookings/bookings.module';
import { ReviewsModule } from './reviews/reviews.module';
import { User } from './users/entities/user.entity';
import { Vendor } from './vendors/entities/vendor.entity';
import { ServiceOffering } from './offerings/entities/offering.entity';
import { Booking } from './bookings/entities/booking.entity';
import { Review } from './reviews/entities/review.entity';
import { ContactMessage } from './contacts/entities/contact-message.entity';
import { ContactsModule } from './contacts/contacts.module';
import { AdminModule } from './admin/admin.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT),
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      entities: [User, Vendor, ServiceOffering, Booking, Review, ContactMessage],
      autoLoadEntities: true,
      synchronize: true,
    }),
    AuthModule,
    UsersModule,
    VendorsModule,
    OfferingsModule,
    BookingsModule,
    ReviewsModule,
    ContactsModule,
    AdminModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
