import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { UserRole } from '../../common/constants';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.USER,
  })
  role: UserRole;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  // For User and Admin
  @Column({ nullable: true })
  name: string;

  // For Vendor
  @Column({ nullable: true })
  organizationName: string;

  @Column({ nullable: true })
  location: string;

  @Column('simple-array', { nullable: true })
  categories: string[];

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
