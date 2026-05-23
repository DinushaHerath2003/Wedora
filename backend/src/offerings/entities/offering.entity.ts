import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Vendor } from '../../vendors/entities/vendor.entity';
import { Booking } from '../../bookings/entities/booking.entity';
import { Review } from '../../reviews/entities/review.entity';

@Entity('service_offerings')
export class ServiceOffering {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ nullable: true })
  description: string;

  @Column()
  category: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  price: number;

  @Column('simple-array', { nullable: true })
  images: string[];

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Foreign Keys & Relations
  @Column()
  vendorId: number;

  @ManyToOne(() => Vendor, (vendor) => vendor.offerings, {
    onDelete: 'CASCADE',
  })
  vendor: Vendor;

  @OneToMany(() => Booking, (booking) => booking.offering)
  bookings: Booking[];

  @OneToMany(() => Review, (review) => review.offering)
  reviews: Review[];
}
