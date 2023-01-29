import { ForbiddenException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuthDto } from './dto';
import * as argon from 'argon2';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

export interface ITokens {
  access_token: string;
  refresh_token: string;
}

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
    private config: ConfigService,
  ) {}
  async signUp(dto: AuthDto): Promise<{ access_token: string }> {
    // generate the password hash
    try {
      const hash = await argon.hash(dto.password);

      // save the new user in the db
      const user = await this.prisma.user.create({
        data: {
          email: dto.email,
          hashedPassword: hash,
        },
      });

      // return the saved user
      return this.getTokens(user.id, user.email);
    } catch (err) {
      console.log(err);
      if (err instanceof PrismaClientKnownRequestError) {
        // P2002 is the error code for unique constraint violation from Prisma
        if (err.code === 'P2002') {
          throw new ForbiddenException('Email already in use');
        }
      }
      throw err;
    }
  }
  async signIn(dto: AuthDto) {
    // find the user by email
    const user = await this.prisma.user.findUnique({
      where: {
        email: dto.email,
      },
    });
    // if the user does not exist, throw exception
    if (!user) {
      throw new ForbiddenException('Invalid credentials');
    }

    // compare the password with the hash
    const pwMatches = await argon.verify(user.hashedPassword, dto.password);
    // if the password is incorrect, throw exception
    if (!pwMatches) {
      throw new ForbiddenException('Invalid credentials');
    }
    // return the user
    return this.getTokens(user.id, user.email);
  }

  async signOut(userId: number): Promise<boolean> {
    await this.prisma.user.updateMany({
      where: {
        id: userId,
        refreshToken: {
          not: null,
        },
      },
      data: {
        refreshToken: null,
      },
    });
    return true;
  }
  async refreshToken(userId: number, refreshToken: string): Promise<ITokens> {
    const user = await this.prisma.user.findUnique({
      where: {
        id: userId,
      },
    });

    if (!user || !user.refreshToken) {
      throw new ForbiddenException('Invalid credentials');
    }

    const refreshTokenMatches = await argon.verify(
      user.refreshToken,
      refreshToken,
    );
    if (!refreshTokenMatches) {
      throw new ForbiddenException('Invalid credentials');
    }

    const tokens = await this.getTokens(user.id, user.email);
    await this.updateRefreshToken(user.id, tokens.refresh_token);

    return tokens;
  }

  async updateRefreshToken(userId: number, refreshToken: string) {
    const hash = await argon.hash(refreshToken);
    await this.prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        refreshToken: hash,
      },
    });
  }

  async getTokens(userId: number, email: string): Promise<ITokens> {
    const data = {
      sub: userId,
      email,
    };
    const [access_token, refresh_token] = await Promise.all([
      this.jwt.signAsync(data, {
        expiresIn: '15m',
        secret: this.config.get('ACCESS_JWT_SECRET'),
      }),
      this.jwt.signAsync(data, {
        expiresIn: '7d',
        secret: this.config.get('REFRESH_JWT_SECRET'),
      }),
    ]);

    await this.updateRefreshToken(userId, refresh_token);

    return {
      access_token,
      refresh_token,
    };
  }
}
