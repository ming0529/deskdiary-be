// import { IsNotEmpty, IsString } from 'class-validator';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, SchemaOptions } from 'mongoose';
import { IsNotEmpty, IsString } from 'class-validator';

const options: SchemaOptions = {
  collection: 'rooms', //데이터베이스명
  timestamps: true, //updateat, createdat 자동으로 찍어줌
};

@Schema(options)
export class Room extends Document {
  @Prop({
    required: true,
  })
  @IsNotEmpty()
  @IsString()
  uuid: string;

  @Prop({
    required: true,
  })
  @IsNotEmpty()
  @IsString()
  owner: number;

  @Prop({ type: Object, required: true }) // userList의 타입을 명시적으로 지정
  @IsNotEmpty()
  @IsString()
  userList: object;
}

export const RoomSchema = SchemaFactory.createForClass(Room);
