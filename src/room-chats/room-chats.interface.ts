export interface IRoomRequest {
  nickname?: string;
  uuid?: string;
  img?: string;
  userId?: number;
}
export interface IMessage {
  time?: string;
  uuid: string;
  nickname: string;
  message: string;
  img: string;
}
