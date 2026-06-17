import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Repository } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Vendor } from '../../vendors/entities/vendor.entity';
import { UserRole } from '../constants';
import { AuthenticatedRequestUser, JwtPayload } from './jwt-payload.type';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly configService: ConfigService,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Vendor)
    private readonly vendorRepository: Repository<Vendor>,
  ) {
    const secret = configService.get<string>('JWT_SECRET');
    if (!secret) {
      throw new Error('JWT_SECRET is not configured');
    }

    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: secret,
    });
  }

  async validate(payload: JwtPayload): Promise<AuthenticatedRequestUser> {
    if (!payload.sub || !payload.email || !payload.role) {
      throw new UnauthorizedException('Invalid token payload');
    }

    if (payload.role === UserRole.VENDOR) {
      const vendorId =
        typeof payload.sub === 'number' ? payload.sub : Number(payload.sub);
      const vendor = await this.vendorRepository.findOne({
        where: { id: vendorId },
      });

      if (!vendor || !vendor.isActive || vendor.email !== payload.email) {
        throw new UnauthorizedException('Invalid vendor token');
      }

      return {
        sub: vendor.id,
        email: vendor.email,
        role: UserRole.VENDOR,
      };
    }

    const user = await this.userRepository.findOne({
      where: { id: String(payload.sub) },
    });

    if (!user || !user.isActive || user.email !== payload.email) {
      throw new UnauthorizedException('Invalid user token');
    }

    return {
      sub: user.id,
      email: user.email,
      role: user.role,
    };
  }
}
