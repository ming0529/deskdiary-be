import { ApiProperty } from '@nestjs/swagger';
import {
  IsInt,
  IsNotEmpty,
  Max,
  MaxLength,
  IsOptional,
  Min,
} from 'class-validator';

export class CreateRoomRequestDto {
  @IsNotEmpty({ message: '이메일이 비어 있으면 안됩니다' })
  @MaxLength(20)
  @ApiProperty({
    description: '방제목',
    example: '새벽스터디',
    required: true,
  })
  readonly title: string;

  @IsInt()
  @Min(2, { message: '방 최대인원은 2명 이상이어야 합니다.' })
  @Max(8, { message: '방 최대인원은 8명 이내이어야 합니다.' })
  @IsNotEmpty()
  @IsNotEmpty({ message: '방 최대인원 설정은 필수 입니다.' })
  @ApiProperty({
    description: '방 최대인원',
    example: 5,
    required: true,
  })
  readonly maxHeadcount: number;

  @IsNotEmpty()
  @IsNotEmpty({ message: '방 카테고리 설정은 필수 입니다.' })
  @ApiProperty({
    description: '방 카테고리',
    example: 'study',
    required: true,
  })
  readonly category: string;

  @IsOptional()
  @ApiProperty({
    description: '방 유의사항',
    required: false,
  })
  readonly note: string;

  @IsOptional()
  @ApiProperty({
    description: '방 썸네일 이미지',
    required: false,
  })
  readonly roomThumnail: string;
}
