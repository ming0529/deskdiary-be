import { Injectable } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { IRoomRequest, UserData } from './room-chats.interface';
import { Logger } from '@nestjs/common';
import { Exception } from '../exception/exception';
import axios from 'axios';
import { baseURL } from '../constant/url.constant';
import { RoomchatsRepository } from './room-chats.repository';

@Injectable()
export class RoomchatsService {
  private logger: Logger = new Logger('RoomchatsService');

  constructor(private roomchatsRepository: RoomchatsRepository) {
    this.logger.log('RoomchatsService constructor');
  }

  async joinRoom(client: Socket, server: Server, iRoomRequest: IRoomRequest) {
    client.leave(client.id);
    const { uuid, nickname, userId } = iRoomRequest;
    const exist = await this.roomchatsRepository.getUserInfo(userId);
    if (exist) {
      await this.leaveRoomRequestToApiServer(uuid);
      return client.emit('joinError', Exception.clientAlreadyConnected);
    }
    client.join(uuid);

    const data = await this.roomchatsRepository.getRoomInfo(uuid);
    if (!data) {
      await this.createRoom(client, iRoomRequest);
    } else {
      await this.updateRoom(client, data, iRoomRequest);
    }
    this.emitEventForUserList(client, server, uuid, nickname, 'new-user');
  }

  async createRoom(client: Socket, iRoomRequest: IRoomRequest) {
    const { nickname, uuid, img, userId } = iRoomRequest;
    const roomData = {
      userList: { [client.id]: { nickname, img, userId } },
    };
    const userData: UserData = {
      clientId: client.id,
      uuid,
      nickname,
    };

    await this.roomchatsRepository.setRoomAndUserAndClient(
      iRoomRequest,
      client.id,
      roomData,
      userData,
    );
  }

  async updateRoom(
    client: Socket,
    roomData: string,
    iRoomRequest: IRoomRequest,
  ) {
    const { uuid, nickname, img, userId } = iRoomRequest;
    const newUser: UserData = {
      clientId: client.id,
      uuid: uuid,
      nickname: nickname,
    };
    const room = JSON.parse(roomData);
    room.userList[client.id] = { nickname, img, userId };

    await this.roomchatsRepository.setRoomAndUserAndClient(
      iRoomRequest,
      client.id,
      room,
      newUser,
    );
  }

  async removeRoom(client: Socket, server: Server, uuid: string) {
    const data = await this.roomchatsRepository.getRoomInfo(uuid);
    if (!data) {
      return this.emitEventForError(client, server, Exception.roomNotFound);
      //return server.to(client.id).emit('error-room', Exception.roomNotFound);
    }
    const findRoom = JSON.parse(data);
    await this.roomchatsRepository.deleteRoom(uuid);

    // 방의 userList를 순회하며 각 사용자의 정보를 삭제합니다.
    for (const clientId in findRoom.userList) {
      const userId = findRoom.userList[clientId]?.userId;
      await this.roomchatsRepository.deleteUserAndClient(userId, clientId);
      this.logger.log(`유저 데이터 삭제함: client:${clientId}, user:${userId}`);
    }
    return server.to(uuid).emit('remove-users', {});
  }

  //유저가1명이면, 혹은 지금나가면 0명남으면 방데이터 삭제
  async leaveRoom(client: Socket, server: Server, uuid: string) {
    const roomData = await this.roomchatsRepository.getRoomInfo(uuid);
    if (!roomData) {
      return this.emitEventForError(client, server, Exception.roomNotFound);
      //return server.to(client.id).emit('error-room', Exception.roomNotFound);
    }
    const room = JSON.parse(roomData);
    const userId: number = room.userList[client.id]?.userId;
    const nickname: string = room.userList[client.id]?.nickname;
    const user = room.userList[client.id];
    if (user) {
      delete room.userList[client.id];
    } else {
      return this.emitEventForError(client, server, Exception.clientNotFound);
    }

    await this.roomchatsRepository.setRoomAndDeleteUserAndClient(
      room,
      uuid,
      userId,
      client.id,
    );

    // 유저리스트 보내주기
    this.emitEventForUserList(client, server, uuid, nickname, 'leave-user');
  }

  async logOut(client: Socket, server: Server, userId: number) {
    const exist = await this.roomchatsRepository.getUserInfo(userId);
    if (!exist) return;
    //방에 아무도 없을경우 방 정보도 삭제해야함
    //방에 유저리스트 이벤트를 쏴줌
    const user = JSON.parse(exist);
    const uuid: string = user.uuid;
    const clientId: string = user.clientId;
    const nickname: string = user.nickename;
    const roomData = await this.roomchatsRepository.getRoomInfo(uuid);
    if (!roomData) {
      return this.emitEventForError(client, server, Exception.roomNotFound);
      //return server.to(client.id).emit('error-room', Exception.roomNotFound);
    }
    const room = JSON.parse(roomData);
    const userInRoom = room.userList[clientId];
    if (!userInRoom) {
      return this.emitEventForError(client, server, Exception.clientNotFound);
      //return server.to(client.id).emit('error-room', Exception.clientNotFound);
    }
    delete room.userList[clientId];
    await this.roomchatsRepository.setRoomAndDeleteUserAndClient(
      room,
      uuid,
      userId,
      clientId,
    );

    const userListObj = room['userList'];
    const userListArr = Object.values(userListObj);

    await this.leaveRoomRequestToApiServer(uuid);
    this.emitToRoom(server, uuid, 'log-out', { logoutUser: userId });
    this.emitToRoom(server, uuid, 'leave-user', { nickname, userListArr });
    // server.to(uuid).emit('log-out', { logoutUser: userId });
    // server.to(uuid).emit('leave-user', { nickname, userListArr });
  }

  isOwner(findRoom: any, userId: number): boolean {
    const findOwnerId = findRoom['ownerId'];
    return userId === findOwnerId;
  }

  async disconnectClient(client: Socket, server: Server) {
    // 클라이언트 ID를 기반으로 사용자 정보 조회
    const exist = await this.roomchatsRepository.getclientInfo(client.id);
    if (!exist) {
      return this.emitEventForError(client, server, Exception.clientNotFound);
      //return server.to(client.id).emit('error-room', Exception.clientNotFound);
    }
    const uuid: string = exist;

    // 방 정보 조회
    const room = await this.roomchatsRepository.getRoomInfo(uuid);
    if (!room) {
      return this.emitEventForError(client, server, Exception.roomNotFound);
      //return server.to(client.id).emit('error-room', Exception.roomNotFound);
    }
    const findroom = JSON.parse(room);
    // 유저리스트에서 클라이언트 ID 제거
    const nickname: string = findroom.userList[client.id]?.nickname;
    const userId: number = findroom.userList[client.id]?.userId;
    delete findroom.userList[client.id];
    //여기서 만약 findroom.userList 가 빈 객체라면 룸정보를 삭제 하도록 함
    //그리고 빈유저리스트를 이벤트 넘김
    //그게 아닐경우 아래를 실행시킴

    await this.roomchatsRepository.setRoomAndDeleteUserAndClient(
      findroom,
      uuid,
      userId,
      client.id,
    );

    await this.leaveRoomRequestToApiServer(uuid);
    //server.to(uuid).emit('disconnect_user', nickname);
    this.emitEventForUserList(client, server, uuid, nickname, 'leave-user');
    this.logger.log(`disconnected: ${client.id}`);
  }

  async emitEventForUserList(
    client: Socket,
    server: Server,
    uuid: string,
    nickname: string,
    userEvent: string,
  ) {
    const roomData = await this.roomchatsRepository.getRoomInfo(uuid);
    if (!roomData) {
      return this.emitEventForError(client, server, Exception.roomNotFound);
      //return server.to(client.id).emit('error-room', Exception.roomNotFound);
    }

    const room = JSON.parse(roomData);
    const userListObj = room['userList'];
    const userListArr = Object.values(userListObj);

    server.to(uuid).emit(userEvent, { nickname, userListArr });
  }

  emitEventForError(client: Socket, server: Server, errorType) {
    server.to(client.id).emit('error-room', errorType);
  }

  emitToRoom(server: Server, uuid: string, event: string, data) {
    server.to(uuid).emit(event, data);
  }

  async leaveRoomRequestToApiServer(uuid: string): Promise<void> {
    const headers = {
      'socket-secret-key': process.env.SOCKET_SECRET_KEY ?? '',
    };

    try {
      const response = await axios.post(
        `${baseURL}/room/socket/leave/${uuid}`,
        undefined,
        {
          headers,
        },
      );
      // 성공한 경우의 처리
      console.log('요청 성공:', response.data);
    } catch (error: any) {
      if (error.response) {
        // 서버 응답이 있는 경우 (HTTP 상태 코드가 2xx가 아닌 경우)
        console.error('HTTP 에러 상태 코드:', error.response.status);
        console.error('HTTP 에러 응답 데이터:', error.response.data);
      } else if (error.request) {
        // 요청은 완료되었지만 서버 응답이 없는 경우
        console.error('요청에 응답이 없습니다.');
      } else {
        // 요청을 보내기 전에 발생한 에러
        console.error('요청을 보내는 중에 에러 발생:', error.message);
      }
    }
  }
}
