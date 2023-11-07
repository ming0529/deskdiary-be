import { Controller, Get, UseGuards, Req, Query } from '@nestjs/common';
import {
  ApiOperation,
  ApiTags,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { Request } from 'express';
import { RoomSearchService } from './room-search.service';
import { JwtAuthGuard } from '../auth/jwt/jwt-auth.guard';
import { RoomAPIDocs } from './room-search.docs';

@ApiTags('Room 조회 API')
@Controller()
export class RoomSearchController {
  constructor(private readonly roomSearchService: RoomSearchService) {}

  @Get('study-rooms/popular')
  @ApiOperation({
    summary: '스터디룸 인기순 조회',
  })
  @ApiResponse(RoomAPIDocs.getRoomListBySearch())
  @ApiQuery(RoomAPIDocs.getRoomListByTypeQueryCursor())
  async getPopularStudyRooms(@Query('cursor') cursor: number) {
    cursor = cursor || 0;
    return await this.roomSearchService.PopularRooms(cursor, 'study');
  }

  @Get('hobby-rooms/popular')
  @ApiOperation({
    summary: '취미룸 인기순 조회',
  })
  @ApiResponse(RoomAPIDocs.getRoomListBySearch())
  @ApiQuery(RoomAPIDocs.getRoomListByTypeQueryCursor())
  async getPopularHobbyRooms(@Query('cursor') cursor: number) {
    cursor = cursor || 0;
    return await this.roomSearchService.PopularRooms(cursor, 'hobby');
  }

  @Get('hobby-rooms/latest')
  @ApiOperation({
    summary: '취미룸 최신순 조회',
  })
  @ApiResponse(RoomAPIDocs.getRoomListBySearch())
  @ApiQuery(RoomAPIDocs.getRoomListByTypeQueryCursor())
  async getLatestHobbyRooms(@Query('cursor') cursor: number) {
    cursor = cursor || 0;
    return await this.roomSearchService.LatestRooms(cursor, 'hobby');
  }

  @Get('study-rooms/latest')
  @ApiOperation({
    summary: '스터디룸 최신순 조회',
  })
  @ApiResponse(RoomAPIDocs.getRoomListBySearch())
  @ApiQuery(RoomAPIDocs.getRoomListByTypeQueryCursor())
  async getLatestStudyRooms(@Query('cursor') cursor: number) {
    cursor = cursor || 0;
    return await this.roomSearchService.LatestRooms(cursor, 'study');
  }

  @Get('study-rooms/popular-top')
  @ApiOperation({
    summary: '스터디룸 인기순 Top10 조회',
  })
  @ApiResponse({
    status: 200,
    description: '스터디룸을 조회수 기준 인기순 Top10으로 조회 합니다.',
  })
  async getPopularStudyRoomsTop10() {
    return await this.roomSearchService.PopularStudyRoomsTop10();
  }

  @Get('hobby-rooms/popular-top')
  @ApiOperation({
    summary: '취미룸 인기순 Top10 조회',
  })
  @ApiResponse({
    status: 200,
    description: '취미룸을 조회수 기준 인기순 Top10 으로 조회 합니다.',
  })
  async getPopularHobbyRoomsTop10() {
    return await this.roomSearchService.PopularHobbyRoomsTop10();
  }

  @Get('/rooms/popular-top')
  @ApiOperation({
    summary: '전체방 인기순 Top10 조회',
  })
  @ApiResponse({
    status: 200,
    description: '전체방을 조회수 기준 인기순 Top10 으로 조회 합니다.',
  })
  async getPopularRoomsTop10() {
    return await this.roomSearchService.PopularRoomsTop10();
  }

  @Get('/rooms/latest-top')
  @ApiOperation({
    summary: '전체방 최신순 Top10 조회',
  })
  @ApiResponse({
    status: 200,
    description: '전체방을 최신순 기준 인기순 Top10 으로 조회 합니다.',
  })
  async getLatestRoomsTop10() {
    return await this.roomSearchService.LatestRoomsTop10();
  }

  @Get('/rooms/my-created')
  @ApiOperation({
    summary: '내가 만든 방 정보 조회',
  })
  @ApiResponse({
    status: 200,
    description: '해당 유저가 owner로 등록된 방 목록을 조회 합니다.',
  })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  async getOwnersRooms(@Req() req: Request) {
    const userId = req.user['userId'];
    return await this.roomSearchService.OwnersRooms(userId);
  }

  //스터디룸에서 검색하고 인기순, 최신순 필터링
  @Get('study-rooms/search')
  @ApiOperation({
    summary: '스터디룸 방제목 검색 결과 조회, 기본값은 인기순',
  })
  @ApiResponse(RoomAPIDocs.getRoomListBySearch())
  @ApiQuery(RoomAPIDocs.getRoomListByTypeQueryFilter())
  @ApiQuery(RoomAPIDocs.getRoomListByTypeQuerySearch())
  @ApiQuery(RoomAPIDocs.getRoomListByTypeQueryCursor())
  async searchStudyRooms(
    @Query('filter') filter: string,
    @Query('search') search: string,
    @Query('cursor') cursor: number,
  ) {
    //"Popularity" 또는 "Latest"
    filter = filter || 'Popularity';
    cursor = cursor || 0;
    const rooms = await this.roomSearchService.searchRooms(
      filter,
      search,
      cursor,
      'study',
    );
    return rooms;
  }

  @Get('hobby-rooms/search')
  @ApiOperation({
    summary: '취미룸 방제목 검색 결과 조회',
  })
  @ApiResponse(RoomAPIDocs.getRoomListBySearch())
  @ApiQuery(RoomAPIDocs.getRoomListByTypeQueryFilter())
  @ApiQuery(RoomAPIDocs.getRoomListByTypeQuerySearch())
  @ApiQuery(RoomAPIDocs.getRoomListByTypeQueryCursor())
  async searchHobbyRooms(
    @Query('filter') filter: string,
    @Query('search') search: string,
    @Query('cursor') cursor: number,
  ) {
    filter = filter || 'Popularity';
    cursor = cursor || 0;
    const rooms = await this.roomSearchService.searchRooms(
      filter,
      search,
      cursor,
      'hobby',
    );
    return rooms;
  }
}
