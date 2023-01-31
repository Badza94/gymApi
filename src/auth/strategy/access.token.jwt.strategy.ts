import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { UserWithRole } from 'src/user/user.type';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class AccessTokenJwtStrategy extends PassportStrategy(
  Strategy,
  'jwt-access-token',
) {
  constructor(config: ConfigService, private prisma: PrismaService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: config.get('ACCESS_JWT_SECRET'),
    });
  }

  async validate(payload: UserWithRole) {
    if (!payload) {
      throw new UnauthorizedException();
    }
    return payload;
  }
}
