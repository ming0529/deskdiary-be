import { Controller, Get, UseGuards, Req } from '@nestjs/common';
import {
  ApiOperation,
  ApiTags,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { Request } from 'express';
import { RoomSearchService } from './room-search.service';
import { JwtAuthGuard } from '../auth/jwt/jwt-auth.guard';

@ApiTags('Room 조회 API')
@Controller()
export class RoomSearchController {
  constructor(private readonly roomSearchService: RoomSearchService) {}

  @Get('study-rooms/popular')
  @ApiOperation({
    summary: '스터디룸 인기순 조회!',
  })
  @ApiResponse({
    status: 200,
    description: '스터디룸을 조회수 기준 인기순으로 조회 합니다.',
  })
  async getPopularStudyRooms() {
    return await this.roomSearchService.PopularStudyRooms();
  }

  @Get('hobby-rooms/popular')
  @ApiOperation({
    summary: '취미룸 인기순 조회',
  })
  @ApiResponse({
    status: 200,
    description: '취미룸을 조회수 기준 인기순으로 조회 합니다.',
  })
  async getPopularHobbyRooms() {
    return await this.roomSearchService.PopularHobbyRooms();
  }

  @Get('rooms/popular')
  @ApiOperation({
    summary: '전체방 인기순 조회',
  })
  async getPopularRooms() {
    return await this.roomSearchService.PopularRooms();
  }

  @Get('rooms/latest')
  @ApiOperation({
    summary: '전체방 최신순 조회',
  })
  async getLatestRooms() {
    return await this.roomSearchService.LatestRooms();
  }

  @Get('hobby-rooms/latest')
  @ApiOperation({
    summary: '취미룸 전체방 최신순 조회',
  })
  @ApiResponse({
    status: 200,
    description: '취미룸을 최신순으로 전체 조회 합니다.',
  })
  async getLatestHobbyRooms() {
    return await this.roomSearchService.LatestHobbyRooms();
  }

  @Get('study-rooms/latest')
  @ApiOperation({
    summary: '스터디룸 전체방 최신순 조회',
  })
  @ApiResponse({
    status: 200,
    description: '스터디룸을 최신순으로 전체 조회 합니다.',
  })
  async getLatestStudyRooms() {
    return await this.roomSearchService.LatestStudyRooms();
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
}
