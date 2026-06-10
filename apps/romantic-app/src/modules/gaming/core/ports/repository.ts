import type {
  Game,
  GameId,
  GameSummary,
  Participant,
  Room,
  RoomId,
} from '../../domain/models';

export type RoomsFilter = {
  search?: string;
  code?: string;
  page?: number;
  limit?: number;
};

export type ParticipantsFilter = {
  filterUserName?: string;
  sortBy?: 'user_name';
  sortDir?: 'asc' | 'desc';
  page?: number;
  limit?: number;
};

export type GamesFilter = {
  filterCategory?: string;
  filterGameName?: string;
  sortBy?: 'order' | 'category' | 'game_name';
  sortDir?: 'asc' | 'desc';
  page?: number;
  limit?: number;
};

export type CreateRoomPayload = {
  name: string;
  visibility: 'public' | 'private';
  password?: string;
};

export type JoinRoomPayload = {
  roomCode: string;
  roomPassword?: string;
};

export type CreateGamePayload = {
  name: string;
  type: 'casual';
  maxPlayers: number;
  timePerQuestion: number;
  category: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  description?: string;
};

export type PagedResult<T> = {
  items: T[];
  total: number;
};

export type IRepository = {
  getRooms(filters: RoomsFilter, signal: AbortSignal): Promise<PagedResult<Room>>;
  createRoom(payload: CreateRoomPayload, signal: AbortSignal): Promise<Room>;
  joinRoom(roomId: RoomId, payload: JoinRoomPayload, signal: AbortSignal): Promise<Participant>;
  getParticipants(roomId: RoomId, filters: ParticipantsFilter, signal: AbortSignal): Promise<PagedResult<Participant>>;
  removeParticipant(roomId: RoomId, userId: string, signal: AbortSignal): Promise<void>;
  getGames(roomId: RoomId, filters: GamesFilter, signal: AbortSignal): Promise<PagedResult<Game>>;
  createGame(roomId: RoomId, payload: CreateGamePayload, signal: AbortSignal): Promise<Game>;
  joinGame(gameId: GameId, signal: AbortSignal): Promise<void>;
  leaveGame(gameId: GameId, userId: string, signal: AbortSignal): Promise<void>;
  updateGameStatus(gameId: GameId, status: 'game_pending' | 'game_finished', signal: AbortSignal): Promise<Game>;
  getGameSummary(gameId: GameId, signal: AbortSignal): Promise<GameSummary>;
  connectGamePlay(gameId: GameId, token: string): WebSocket;
};
