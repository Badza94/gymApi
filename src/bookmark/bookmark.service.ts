import { ForbiddenException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateBookmarkDto, EditBookmarkDto } from './dto';

@Injectable()
export class BookmarkService {
  constructor(private prisma: PrismaService) {}
  async getBookmarks(
    userId: number,
    params: {
      page?: number;
      limit?: number;
      order?: 'asc' | 'desc';
    },
  ) {
    const { page, limit, order } = params;

    const skip =
      page !== undefined && limit !== undefined ? (page - 1) * limit : 0;
    const orderBy = order !== undefined ? order : 'asc';
    return this.prisma.bookmark.findMany({
      skip,
      take: limit,
      where: {
        userId,
      },
      orderBy: {
        createdAt: orderBy,
      },
    });
  }

  getBookmarksById(userId: number, bookmarkId: number) {
    const bookmark = this.prisma.bookmark.findFirst({
      where: {
        id: bookmarkId,
        userId,
      },
    });
    return bookmark;
  }

  async createBookmark(userId: number, dto: CreateBookmarkDto) {
    const bookmark = await this.prisma.bookmark.create({
      data: {
        userId,
        ...dto,
      },
    });

    return bookmark;
  }

  async editBookmarksById(
    userId: number,
    bookmarkId: number,
    dto: EditBookmarkDto,
  ) {
    // get the bookmark by id
    const bookmark = await this.prisma.bookmark.findUnique({
      where: {
        id: bookmarkId,
      },
    });

    if (!bookmark || bookmark.userId !== userId) {
      throw new ForbiddenException('You do not own this bookmark');
    }

    // check if user owns the bookmark
    const updatedBookmark = await this.prisma.bookmark.update({
      where: {
        id: bookmarkId,
      },
      data: {
        ...dto,
      },
    });

    return updatedBookmark;
  }

  async deleteBookmarksById(userId: number, bookmarkId: number) {
    const bookmark = await this.prisma.bookmark.findUnique({
      where: {
        id: bookmarkId,
      },
    });

    if (!bookmark || bookmark.userId !== userId) {
      throw new ForbiddenException('You do not own this bookmark');
    }
    await this.prisma.bookmark.delete({
      where: {
        id: bookmarkId,
      },
    });
  }
}
