import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { ServiceOffering } from '../../offerings/entities/offering.entity';
import { Booking } from '../../bookings/entities/booking.entity';
import { Review } from '../../reviews/entities/review.entity';

@Entity('vendors')
export class Vendor {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @Column()
  organizationName: string;

  @Column({ nullable: true })
  phone: string;

  @Column({ nullable: true })
  location: string;

  @Column('simple-array', { nullable: true })
  categories: string[];

  @Column({ nullable: true })
  contactPerson: string;

  @Column({ default: false })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relations
  @OneToMany(() => ServiceOffering, (offering) => offering.vendor, { cascade: true })
  offerings: ServiceOffering[];

  @OneToMany(() => Booking, (booking) => booking.vendor)
  bookings: Booking[];

  @OneToMany(() => Review, (review) => review.vendor)
  reviews: Review[];
}
