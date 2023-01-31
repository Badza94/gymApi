import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { Order, Role } from '../enums';
import { GetUserProp } from '../auth/decorator';
import { AccessTokenGuard, RolesGuard } from '../auth/guard';
import { BookmarkService } from './bookmark.service';
import { CreateBookmarkDto, EditBookmarkDto } from './dto';
import { Roles } from 'src/user/decorator/roles.decorator';

@UseGuards(AccessTokenGuard)
@Roles(Role.ADMIN)
@Controller('bookmarks')
export class BookmarkController {
  constructor(private bookmarkService: BookmarkService) {}
  @Get()
  getBookmarks(
    @GetUserProp('id') userId: number,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('order') order?: Order.ASC | Order.DESC,
  ) {
    return this.bookmarkService.getBookmarks(userId, {
      page: Number(page),
      limit: Number(limit),
      order,
    });
  }

  @Get(':id')
  getBookmarksById(
    @GetUserProp('id') userId: number,
    @Param('id', ParseIntPipe) bookmarkId: number,
  ) {
    return this.bookmarkService.getBookmarksById(userId, bookmarkId);
  }

  @Post()
  createBookmark(
    @GetUserProp('id') userId: number,
    @Body() dto: CreateBookmarkDto,
  ) {
    return this.bookmarkService.createBookmark(userId, dto);
  }

  @Patch(':id')
  editBookmarksById(
    @GetUserProp('id') userId: number,
    @Param('id', ParseIntPipe) bookmarkId: number,
    @Body() dto: EditBookmarkDto,
  ) {
    return this.bookmarkService.editBookmarksById(userId, bookmarkId, dto);
  }

  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete(':id')
  deleteBookmarksById(
    @GetUserProp('id') userId: number,
    @Param('id', ParseIntPipe) bookmarkId: number,
  ) {
    return this.bookmarkService.deleteBookmarksById(userId, bookmarkId);
  }
}
