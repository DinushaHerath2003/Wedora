import { Injectable, ConflictException, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from '../users/entities/user.entity';
import { SignupDto, LoginDto } from './dto/auth.dto';
import { UserRole } from '../common/constants';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async signup(signupDto: SignupDto) {
    const { email, password, role, name, organizationName, location, categories } = signupDto;

    // Check if user already exists
    const existingUser = await this.userRepository.findOne({ where: { email } });
    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    // Validate role-specific fields
    if (role === UserRole.USER || role === UserRole.ADMIN) {
      if (!name) {
        throw new BadRequestException('Name is required for users and admins');
      }
    }

    if (role === UserRole.VENDOR) {
      if (!organizationName || !location) {
        throw new BadRequestException('Organization name and location are required for vendors');
      }
      if (!categories || categories.length === 0) {
        throw new BadRequestException('At least one category is required for vendors');
      }
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = this.userRepository.create({
      email,
      password: hashedPassword,
      role,
      ...(role === UserRole.USER || role === UserRole.ADMIN ? { name } : {}),
      ...(role === UserRole.VENDOR ? { organizationName, location, categories } : {}),
    });

    await this.userRepository.save(user);

    // Generate a simple token (in production, use JWT)
    const token = Buffer.from(`${user.id}:${Date.now()}`).toString('base64');

    // Return user data without password
    const { password: _, ...userWithoutPassword } = user;

    return {
      token,
      user: userWithoutPassword,
    };
  }

  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;

    // Find user by email
    const user = await this.userRepository.findOne({ where: { email } });
    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    // Check if user is active
    if (!user.isActive) {
      throw new UnauthorizedException('Account is deactivated');
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid email or password');
    }

    // Generate a simple token (in production, use JWT)
    const token = Buffer.from(`${user.id}:${Date.now()}`).toString('base64');

    // Return user data without password
    const { password: _, ...userWithoutPassword } = user;

    return {
      token,
      user: userWithoutPassword,
    };
  }
}
