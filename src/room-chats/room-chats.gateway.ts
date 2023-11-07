import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  ConnectedSocket,
  MessageBody,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';
import { LocalDateTime } from '@js-joda/core';
import { RoomchatsService } from './room-chats.service';
import { IMessage, IRoomRequest } from './room-chats.interface';

@WebSocketGateway({ cors: true, allowEIO3: true })
export class RoomchatsGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer() server: Server;
  private logger: Logger = new Logger('AppGateway');

  constructor(private readonly roomchatsService: RoomchatsService) {}

  // 메시지를 방에 있는 유저들에게 보냄
  @SubscribeMessage('msgToServer')
  handleMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() { uuid, message, nickname, img }: IMessage,
  ): void {
    const localDateTime = LocalDateTime.now().plusHours(9);
    const period = localDateTime.hour() < 12 ? 'AM' : 'PM';
    const formattedHour = localDateTime.hour() % 12 || 12;
    const minute = localDateTime.minute().toString().padStart(2, '0');
    const emitMessage: IMessage = {
      message,
      time: `${formattedHour}:${minute} ${period}`,
      nickname,
      uuid,
      img,
    };
    this.logger.log(emitMessage);
    this.server.to(uuid).emit('msgToClient', emitMessage);
  }

  // 방에 참석함
  @SubscribeMessage('joinRoom')
  handleJoinRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() { nickname, uuid, img, userId }: IRoomRequest,
  ): void {
    this.roomchatsService.joinRoom(client, this.server, {
      nickname,
      uuid,
      img,
      userId,
    });
  }

  // 방을 삭제함
  @SubscribeMessage('removeRoom')
  handleRemoveRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() { uuid }: IRoomRequest,
  ): void {
    this.roomchatsService.removeRoom(client, this.server, uuid);
  }

  // 방을 떠남
  @SubscribeMessage('leave-room')
  handleLeaveRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() { uuid }: IRoomRequest,
  ): void {
    client.leave(uuid);
    this.roomchatsService.leaveRoom(client, this.server, uuid);
  }

  //로그아웃
  @SubscribeMessage('log-out')
  handleLogOut(
    @ConnectedSocket() client: Socket,
    @MessageBody() { userId }: IRoomRequest,
  ): void {
    this.roomchatsService.logOut(client, this.server, userId);
  }

  //회원탈퇴로 인한 방 퇴장시키기
  @SubscribeMessage('withdrawal')
  handleKickRoomByWithdrawal(
    @ConnectedSocket() client: Socket,
    @MessageBody() { userId }: IRoomRequest,
  ): void {
    this.roomchatsService.KickRoomByWithdrawal(client, this.server, userId);
  }

  afterInit() {
    this.logger.log('init');
  }

  handleConnection(@ConnectedSocket() client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(@ConnectedSocket() client: Socket) {
    this.logger.log('disconnected');
    this.roomchatsService.disconnectClient(client, this.server);
  }
}
