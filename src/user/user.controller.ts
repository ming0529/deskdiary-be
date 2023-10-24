import {
  Body,
  Controller,
  Get,
  HttpCode,
  Post,
  Put,
  Res,
  Req,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiTags,
  ApiResponse,
} from '@nestjs/swagger';
import {
  UpdatePasswordExample,
  GetProfileExample,
  UpdateProfileExample,
} from './user.response.exampes';
import { Response } from 'express';
import { JwtAuthGuard } from '../auth/jwt/jwt-auth.guard';

import { UserService } from './user.service';
import { JoinUserDto } from './dto/join.user.dto';
import { LoginUserDto } from './dto/login.user.dto';
import { UpdateProfileDto } from './dto/update.profile.dto';
import { UpdatePasswordDto } from './dto/update.password.dto';
import { FileInterceptor } from '@nestjs/platform-express';

@ApiTags('Join')
@Controller('auth')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @ApiOperation({ summary: '회원가입' })
  @Post('join')
  @HttpCode(200)
  async createUserAccount(@Body() joinuserDto: JoinUserDto) {
    return await this.userService.signUp(joinuserDto);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: '로그인' })
  @Post('login')
  async login(
    @Body() loginuserDto: LoginUserDto,
    @Res() res: Response,
  ): Promise<void> {
    await this.userService.login(loginuserDto, res);
  }

  @Put('password')
  @ApiBearerAuth()
  @ApiOperation({
    summary: '비밀번호 수정',
  })
  @ApiResponse({
    status: 200,
    description:
      '유저의 현재 비밀번호가 일치한 것을 확인하고 수정할 비밀번호와 확인을 통해 비밀번호를 수정합니다.',
    content: {
      examples: UpdatePasswordExample,
    },
  })
  @UseGuards(JwtAuthGuard)
  async updatePassword(
    @Req() req: any,
    @Body() updatePasswordDto: UpdatePasswordDto,
  ) {
    if (!updatePasswordDto.isDifferent()) {
      throw new BadRequestException(
        '현재 비밀번호와 새로운 비밀번호가 일치하면 안됩니다',
      );
    }
    const userId = req.user['userId'];
    return this.userService.updatePassword(userId, updatePasswordDto);
  }

  // @ApiOperation({ summary: '로그아웃' })
  // @Post('logout')
  // async logout(@Body() loginuserDto: LoginUserDto) {
  //   return await this.userService.logout(loginuserDto.email);
  // }

  // 마이페이지 유저 정보 조회 (프로필이미지, 닉네임, 이메일, 목표 시간 등)
  @Get('profile')
  @ApiBearerAuth()
  @ApiOperation({
    summary: '프로필 조회',
  })
  @ApiResponse({
    status: 200,
    description: '유저의 닉네임을 조회합니다.',
    content: {
      examples: GetProfileExample,
    },
  })
  @UseGuards(JwtAuthGuard)
  async getProfile(@Req() req: any) {
    console.log(req.user);
    const userId = req.user['userId'];
    return this.userService.getProfile(userId);
  }

  @Put('profile')
  @ApiBearerAuth()
  @ApiOperation({
    summary: '프로필 수정',
  })
  @ApiResponse({
    status: 200,
    description: '유저의 닉네임을 수정합니다.',
    content: {
      examples: UpdateProfileExample,
    },
  })
  @UseGuards(JwtAuthGuard)
  async updateProfile(
    @Req() req: any,
    @Body() updateProfileDto: UpdateProfileDto,
  ) {
    const userId = req.user['userId'];
    return this.userService.updateProfile(userId, updateProfileDto);
  }
  @Post('profile/image')
  @ApiBearerAuth()
  @ApiOperation({
    summary: '프로필 이미지 수정',
  })
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('image'))
  async updateProfileImage(
    @Req() req: any,
    @UploadedFile() file: Express.Multer.File,
  ) {
    console.log('updateProfileImage called');
    console.log(file);
    const userId = req.user['userId'];
    return this.userService.updateProfileImage(userId, file);
  }
}
