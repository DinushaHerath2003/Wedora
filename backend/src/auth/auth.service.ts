import { Injectable, ConflictException, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from '../users/entities/user.entity';
import { SignupDto, LoginDto } from './dto/auth.dto';
import { UserRole } from '../common/constants';
import { JwtPayload } from '../common/auth/jwt-payload.type';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private readonly jwtService: JwtService,
  ) {}

  async signup(signupDto: SignupDto) {
    const { email, password, role, name, organizationName, location, categories } = signupDto;

    // Check if user already exists
    const existingUser = await this.userRepository.findOne({ where: { email } });
    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    if (role === UserRole.ADMIN) {
      throw new BadRequestException('Admin accounts must be created by an existing administrator');
    }

    // Validate role-specific fields
    if (role === UserRole.USER) {
      if (!name) {
        throw new BadRequestException('Name is required for users');
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
      ...(role === UserRole.USER ? { name } : {}),
      ...(role === UserRole.VENDOR ? { organizationName, location, categories } : {}),
    });

    await this.userRepository.save(user);

    // Return user data without password
    const { password: _, ...userWithoutPassword } = user;

    return {
      accessToken: this.generateAccessToken(user),
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

    // Return user data without password
    const { password: _, ...userWithoutPassword } = user;

    return {
      accessToken: this.generateAccessToken(user),
      user: userWithoutPassword,
    };
  }

  async getCurrentUser(authUser: JwtPayload) {
    const user = await this.userRepository.findOne({
      where: { id: String(authUser.sub) },
    });

    if (!user || !user.isActive) {
      throw new UnauthorizedException('User not found');
    }

    const { password: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  private generateAccessToken(user: User): string {
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };

    return this.jwtService.sign(payload);
  }
}
