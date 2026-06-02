import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
  JoinColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { ServiceOffering } from '../../offerings/entities/offering.entity';
import { Vendor } from '../../vendors/entities/vendor.entity';

export enum BookingStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

@Entity('bookings')
export class Booking {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', nullable: true, default: null })
  userId: string | null;

  @Column()
  offeringId: number;

  @Column()
  vendorId: number;

  @Column({ type: 'date' })
  eventDate: Date;

  @Column({ type: 'varchar', nullable: true, default: null })
  eventTime: string | null;

  @Column({ type: 'varchar', nullable: true, default: null })
  clientName: string | null;

  @Column({ type: 'varchar', nullable: true, default: null })
  clientEmail: string | null;

  @Column({ type: 'varchar', nullable: true, default: null })
  clientPhone: string | null;

  @Column({ type: 'int', nullable: true })
  guestCount: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, nullable: true })
  budget: number;

  @Column({
    type: 'enum',
    enum: BookingStatus,
    default: BookingStatus.PENDING,
  })
  status: BookingStatus;

  @Column({ nullable: true })
  notes: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relations
  @ManyToOne(() => User, { onDelete: 'CASCADE', nullable: true })
  @JoinColumn({ name: 'userId' })
  user?: User;

  @ManyToOne(() => ServiceOffering, (offering) => offering.bookings, {
    onDelete: 'CASCADE',
  })
  offering: ServiceOffering;

  @ManyToOne(() => Vendor, (vendor) => vendor.bookings, {
    onDelete: 'CASCADE',
  })
  vendor: Vendor;
}
