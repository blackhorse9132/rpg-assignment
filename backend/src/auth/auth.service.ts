import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
import { User } from '../users/user.entity';
import { AuthPayload } from './models/auth-payload.model';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async register(email: string, password: string): Promise<AuthPayload> {
    const existingUser = await this.usersService.findByEmail(email);
    if (existingUser) {
      throw new UnauthorizedException('Email is already in use');
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await this.usersService.create(email, passwordHash);
    return this.buildAuthPayload(user);
  }

  async login(email: string, password: string): Promise<AuthPayload> {
    const user = await this.usersService.findByEmail(email);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const passwordMatches = await bcrypt.compare(password, user.passwordHash);
    if (!passwordMatches) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return this.buildAuthPayload(user);
  }

  me(userId: string): Promise<User | null> {
    return this.usersService.findById(userId);
  }

  private buildAuthPayload(user: User): AuthPayload {
    const accessToken = this.jwtService.sign({
      sub: user.id,
      email: user.email,
    });
    return { accessToken, user };
  }

  getJwtSecret(): string {
    return this.configService.get<string>(
      'JWT_SECRET',
      'change-me-in-production',
    );
  }
}
