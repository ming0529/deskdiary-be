import { IsNotEmpty, IsString } from 'class-validator';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, SchemaOptions } from 'mongoose';

const options: SchemaOptions = {
  collection: 'sockets',
  timestamps: true,
};

@Schema(options)
export class Socket extends Document {
  @Prop({
    required: true,
  })
  @IsNotEmpty()
  @IsString()
  clientId: string; //소켓아이디

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
  nickname: string;

  @Prop({
    required: true,
  })
  @IsNotEmpty()
  @IsString()
  userId: number;
}

export const SocketSchema = SchemaFactory.createForClass(Socket);
