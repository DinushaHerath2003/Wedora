import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from '../users/entities/user.entity';
import { Vendor } from '../vendors/entities/vendor.entity';
import { Booking } from '../bookings/entities/booking.entity';
import { UserRole } from '../common/constants';
import { ContactsService } from '../contacts/contacts.service';
import { AdminUpdateUserDto, AdminUpdateVendorDto } from './dto/admin.dto';
import { ContactMessageStatus } from '../contacts/entities/contact-message.entity';

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Vendor)
    private vendorRepository: Repository<Vendor>,
    @InjectRepository(Booking)
    private bookingRepository: Repository<Booking>,
    private contactsService: ContactsService,
  ) {}

  private stripPassword<T extends { password?: string }>(entity: T) {
    const { password: _, ...rest } = entity;
    return rest;
  }

  private getLastSixMonths(): { key: string; label: string }[] {
    const months: { key: string; label: string }[] = [];
    const now = new Date();

    for (let i = 5; i >= 0; i -= 1) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      const label = date.toLocaleDateString('en-US', { month: 'short' });
      months.push({ key, label });
    }

    return months;
  }

  async getStats() {
    const [users, vendors, bookings, messages, unreadMessages] = await Promise.all([
      this.userRepository.find(),
      this.vendorRepository.find(),
      this.bookingRepository.find(),
      this.contactsService.findAll().catch(() => []),
      this.contactsService.countUnread().catch(() => 0),
    ]);

    const totalUsers = users.filter((u) => u.role === UserRole.USER).length;
    const totalAdmins = users.filter((u) => u.role === UserRole.ADMIN).length;
    const totalVendors = vendors.length;
    const totalBookings = bookings.length;
    const totalRevenue = bookings.reduce(
      (sum, booking) => sum + Number(booking.budget ?? 0),
      0,
    );

    const usersByRole = [
      { name: 'Users', value: totalUsers, color: '#2196F3' },
      { name: 'Admins', value: totalAdmins, color: '#755A7B' },
      {
        name: 'Vendor Accounts',
        value: users.filter((u) => u.role === UserRole.VENDOR).length,
        color: '#A495A8',
      },
    ].filter((item) => item.value > 0);

    const vendorsByStatus = [
      { name: 'Active', value: vendors.filter((v) => v.isActive).length, color: '#4CAF50' },
      { name: 'Inactive', value: vendors.filter((v) => !v.isActive).length, color: '#EF4444' },
    ].filter((item) => item.value > 0);

    const bookingStatusMap = new Map<string, number>();
    for (const booking of bookings) {
      const status = booking.status || 'pending';
      bookingStatusMap.set(status, (bookingStatusMap.get(status) ?? 0) + 1);
    }

    const bookingsByStatus = Array.from(bookingStatusMap.entries()).map(([name, value]) => ({
      name: name.charAt(0).toUpperCase() + name.slice(1),
      value,
      color:
        name === 'confirmed'
          ? '#4CAF50'
          : name === 'completed'
            ? '#755A7B'
            : name === 'cancelled'
              ? '#EF4444'
              : '#FF9800',
    }));

    const messageStatusMap: Record<ContactMessageStatus, number> = {
      [ContactMessageStatus.NEW]: 0,
      [ContactMessageStatus.READ]: 0,
      [ContactMessageStatus.REPLIED]: 0,
    };

    for (const message of messages) {
      messageStatusMap[message.status] += 1;
    }

    const messagesByStatus = [
      { name: 'New', value: messageStatusMap.new, color: '#2196F3' },
      { name: 'Read', value: messageStatusMap.read, color: '#FF9800' },
      { name: 'Replied', value: messageStatusMap.replied, color: '#4CAF50' },
    ].filter((item) => item.value > 0);

    const monthBuckets = this.getLastSixMonths();
    const monthlyActivity = monthBuckets.map(({ key, label }) => {
      const userCount = users.filter((user) => {
        const created = new Date(user.createdAt);
        const monthKey = `${created.getFullYear()}-${String(created.getMonth() + 1).padStart(2, '0')}`;
        return monthKey === key;
      }).length;

      const vendorCount = vendors.filter((vendor) => {
        const created = new Date(vendor.createdAt);
        const monthKey = `${created.getFullYear()}-${String(created.getMonth() + 1).padStart(2, '0')}`;
        return monthKey === key;
      }).length;

      const bookingCount = bookings.filter((booking) => {
        const created = new Date(booking.createdAt);
        const monthKey = `${created.getFullYear()}-${String(created.getMonth() + 1).padStart(2, '0')}`;
        return monthKey === key;
      }).length;

      return {
        month: label,
        users: userCount,
        vendors: vendorCount,
        bookings: bookingCount,
      };
    });

    const platformOverview = [
      { name: 'Users', count: totalUsers, color: '#2196F3' },
      { name: 'Vendors', count: totalVendors, color: '#FF9800' },
      { name: 'Bookings', count: totalBookings, color: '#9C27B0' },
      { name: 'Messages', count: messages.length, color: '#755A7B' },
    ];

    return {
      totalUsers,
      totalAdmins,
      totalVendors,
      totalBookings,
      totalRevenue,
      totalMessages: messages.length,
      unreadMessages,
      usersByRole,
      vendorsByStatus,
      bookingsByStatus,
      messagesByStatus,
      monthlyActivity,
      platformOverview,
    };
  }

  async findAllUsers(): Promise<Partial<User>[]> {
    const users = await this.userRepository.find({
      order: { createdAt: 'DESC' },
    });
    return users.map((u) => this.stripPassword(u));
  }

  async findUser(id: string) {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return this.stripPassword(user);
  }

  async updateUser(id: string, dto: AdminUpdateUserDto) {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (dto.email && dto.email !== user.email) {
      const existing = await this.userRepository.findOne({
        where: { email: dto.email },
      });
      if (existing) {
        throw new BadRequestException('Email already in use');
      }
    }

    const updateData: Partial<User> = { ...dto };
    if (dto.password) {
      updateData.password = await bcrypt.hash(dto.password, 10);
    }

    await this.userRepository.update(id, updateData);
    return this.findUser(id);
  }

  async removeUser(id: string) {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    await this.userRepository.delete(id);
    return { message: 'User deleted successfully' };
  }

  async findAllVendors() {
    const vendors = await this.vendorRepository.find({
      relations: ['offerings'],
      order: { createdAt: 'DESC' },
    });
    return vendors.map((v) => this.stripPassword(v));
  }

  async findVendor(id: number) {
    const vendor = await this.vendorRepository.findOne({
      where: { id },
      relations: ['offerings', 'bookings', 'reviews'],
    });
    if (!vendor) {
      throw new NotFoundException('Vendor not found');
    }
    return this.stripPassword(vendor);
  }

  async updateVendor(id: number, dto: AdminUpdateVendorDto) {
    const vendor = await this.vendorRepository.findOne({ where: { id } });
    if (!vendor) {
      throw new NotFoundException('Vendor not found');
    }

    if (dto.email && dto.email !== vendor.email) {
      const existing = await this.vendorRepository.findOne({
        where: { email: dto.email },
      });
      if (existing) {
        throw new BadRequestException('Email already in use');
      }
    }

    await this.vendorRepository.update(id, dto);
    return this.findVendor(id);
  }

  async removeVendor(id: number) {
    const vendor = await this.vendorRepository.findOne({ where: { id } });
    if (!vendor) {
      throw new NotFoundException('Vendor not found');
    }
    await this.vendorRepository.delete(id);
    return { message: 'Vendor deleted successfully' };
  }
}
