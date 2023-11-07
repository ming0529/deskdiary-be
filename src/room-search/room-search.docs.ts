import { ApiQueryOptions, ApiResponseOptions } from '@nestjs/swagger';

export class RoomAPIDocs {
  static getRoomListByTypeQueryFilter(): ApiQueryOptions {
    return {
      name: 'filter',
      example: 'Popularity(인기순) 혹은 Latest(최신순)',
      description: '인기순 or 최신순으로 조회합니다.',
    };
  }

  static getRoomListByTypeQueryCursor(): ApiQueryOptions {
    return {
      name: 'cursor',
      example: 12,
      description: '유저가 마지막으로 본 룸의 roomId(고유값)를 나타냅니다',
    };
  }

  static getRoomListByTypeQuerySearch(): ApiQueryOptions {
    return {
      name: 'search',
      example: '오버워치',
      description: '방제목을 검색합니다.',
    };
  }

  static getRoomListBySearch(): ApiResponseOptions {
    return {
      status: 200,
      description: `QueryResults는 검색 결과 방 정보들을 나타냅니다.
      myCursor는 마지막 데이터의 roomId 즉, 다음 cursor에 들어갈 값을 나타냅니다.
      isEnded는 더 이상 반환할 데이터가 없을 시 true를 반환하며 받을 데이터가 남아있는 경우 false를 반환합니다.`,
    };
  }
}
