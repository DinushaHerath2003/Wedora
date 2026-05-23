import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { ServiceOffering } from '../../offerings/entities/offering.entity';
import { Vendor } from '../../vendors/entities/vendor.entity';

@Entity('reviews')
export class Review {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  userId: string;

  @Column()
  offeringId: number;

  @Column()
  vendorId: number;

  @Column({ type: 'int' })
  rating: number;

  @Column({ type: 'text', nullable: true })
  comment: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relations
  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  user: User;

  @ManyToOne(() => ServiceOffering, (offering) => offering.reviews, {
    onDelete: 'CASCADE',
  })
  offering: ServiceOffering;

  @ManyToOne(() => Vendor, (vendor) => vendor.reviews, {
    onDelete: 'CASCADE',
  })
  vendor: Vendor;
}
