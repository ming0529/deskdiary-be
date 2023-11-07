import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class RoomSearchService {
  constructor(private prisma: PrismaService) {}

  //취미룸 인기순 최신순, 스터디룸 인기순 최신순 Cursor-based pagination
  async PopularRooms(cursor: number, category: string) {
    const pageSize = 12;
    const lastId = cursor;
    const QueryResults = await this.prisma.room.findMany({
      where: { category },
      orderBy: {
        count: 'desc',
      },
      take: pageSize,
      skip: lastId ? 1 : 0,
      ...(lastId && { cursor: { roomId: lastId } }), //lastId가 존재하면 { cursor: { id: lastId } + spread연산자 = cursor: { id: lastId }
    });
    const lastPostInResults = QueryResults[pageSize - 1]; // Remember: zero-based index! :)
    const myCursor = lastPostInResults?.roomId;
    const isEnded = QueryResults.length < pageSize; //페이지에는 데이터 20개 들어가야 하는데 그것보다 적게 나머지가 찍히므로.
    return { QueryResults, myCursor, isEnded };
  }

  async LatestRooms(cursor: number, category: string) {
    const pageSize = 12;
    const lastId = cursor;
    const QueryResults = await this.prisma.room.findMany({
      where: { category },
      orderBy: {
        createdAt: 'desc',
      },
      take: pageSize,
      skip: lastId ? 1 : 0,
      ...(lastId && { cursor: { roomId: lastId } }),
    });
    const lastPostInResults = QueryResults[pageSize - 1]; // Remember: zero-based index! :)
    const myCursor = lastPostInResults?.roomId;
    const isEnded = QueryResults.length < pageSize;
    return { QueryResults, myCursor, isEnded };
  }

  //? Top10
  async PopularHobbyRoomsTop10() {
    return this.prisma.room.findMany({
      where: { category: 'hobby' },
      orderBy: {
        count: 'desc',
      },
      take: 10,
    });
  }
  async PopularStudyRoomsTop10() {
    return this.prisma.room.findMany({
      where: { category: 'study' },
      orderBy: {
        count: 'desc',
      },
      take: 10,
    });
  }

  async PopularRoomsTop10() {
    return this.prisma.room.findMany({
      orderBy: {
        count: 'desc',
      },
      take: 10,
    });
  }
  async LatestRoomsTop10() {
    return this.prisma.room.findMany({
      orderBy: {
        createdAt: 'desc',
      },
      take: 10,
    });
  }

  async OwnersRooms(userId: number) {
    const rooms = await this.prisma.room.findMany({
      where: { ownerId: userId },
    });
    return rooms;
  }

  async searchRooms(
    filter: string,
    search: string,
    cursor: number,
    category: string,
  ) {
    //기본이 인기순
    let orderBy: Record<string, 'asc' | 'desc'> = { count: 'desc' };
    if (filter === 'Latest') {
      orderBy = { createdAt: 'desc' };
    }
    const pageSize = 12;
    const lastId = cursor;
    const QueryResults = await this.prisma.room.findMany({
      where: {
        category: category,
        title: {
          contains: search,
        },
      },
      orderBy,
      take: pageSize,
      skip: lastId ? 1 : 0,
      ...(lastId && { cursor: { roomId: lastId } }),
    });
    const lastPostInResults = QueryResults[pageSize - 1]; // Remember: zero-based index! :)
    const myCursor = lastPostInResults?.roomId;
    const isEnded = QueryResults.length < pageSize;
    return { QueryResults, myCursor, isEnded };
  }
}
