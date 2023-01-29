import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { PrismaModule } from './prisma/prisma.module';
import { BookmarkController } from './bookmark/bookmark.controller';
import { BookmarkService } from './bookmark/bookmark.service';
import { BookmarkModule } from './bookmark/bookmark.module';
import { APP_GUARD } from '@nestjs/core';
import { AccessTokenGuard } from './auth/guard';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    AuthModule,
    UserModule,
    BookmarkModule,
    PrismaModule,
  ],
  controllers: [BookmarkController],
  providers: [
    {
      provide: APP_GUARD,
      useClass: AccessTokenGuard,
    },
    BookmarkService,
  ],
})
export class AppModule {}
