import type {
  Game,
  GameId,
  GameSummary,
  Participant,
  Room,
  RoomId,
} from '../domain/models';
import type {
  CreateGamePayload,
  CreateRoomPayload,
  GamesFilter,
  IRepository,
  JoinRoomPayload,
  PagedResult,
  ParticipantsFilter,
  RoomsFilter,
} from '../core/ports/repository';
import {
  toGame,
  toGameSummary,
  toParticipant,
  toRoom,
} from './mappers';

const BASE = '/api/v1';

const buildUrl = (path: string, params?: Record<string, string | number | boolean | undefined>): string => {
  const url = new URL(path, window.location.origin);
  if (params) {
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined) {
        url.searchParams.set(key, String(value));
      }
    }
  }
  return url.toString();
};

const throwIfNotOk = (response: Response): void => {
  if (!response.ok) {
    throw new Error(response.statusText);
  }
};

export const createRepository = (): IRepository => ({
  getRooms: async (filters: RoomsFilter, signal: AbortSignal): Promise<PagedResult<Room>> => {
    const url = buildUrl(`${BASE}/rooms`, {
      search: filters.search,
      code: filters.code,
      page: filters.page,
      limit: filters.limit,
    });
    const response = await fetch(url, { signal });
    throwIfNotOk(response);
    const data = (await response.json()) as any;
    return {
      items: (data.rooms ?? []).map(toRoom),
      total: data.total,
    };
  },

  createRoom: async (payload: CreateRoomPayload, signal: AbortSignal): Promise<Room> => {
    const url = buildUrl(`${BASE}/rooms`);
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      signal,
    });
    throwIfNotOk(response);
    const data = (await response.json()) as any;
    return toRoom(data.room);
  },

  joinRoom: async (roomId: RoomId, payload: JoinRoomPayload, signal: AbortSignal): Promise<Participant> => {
    const url = buildUrl(`${BASE}/rooms/${roomId}/participants`);
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      signal,
    });
    throwIfNotOk(response);
    const data = (await response.json()) as any;
    return toParticipant(data.participant);
  },

  getParticipants: async (roomId: RoomId, filters: ParticipantsFilter, signal: AbortSignal): Promise<PagedResult<Participant>> => {
    const url = buildUrl(`${BASE}/rooms/${roomId}/participants`, {
      filterUserName: filters.filterUserName,
      sortBy: filters.sortBy,
      sortDir: filters.sortDir,
      page: filters.page,
      limit: filters.limit,
    });
    const response = await fetch(url, { signal });
    throwIfNotOk(response);
    const data = (await response.json()) as any;
    return {
      items: (data.participants ?? []).map(toParticipant),
      total: data.total,
    };
  },

  removeParticipant: async (roomId: RoomId, userId: string, signal: AbortSignal): Promise<void> => {
    const url = buildUrl(`${BASE}/rooms/${roomId}/participants/${userId}`);
    const response = await fetch(url, { method: 'DELETE', signal });
    throwIfNotOk(response);
  },

  getGames: async (roomId: RoomId, filters: GamesFilter, signal: AbortSignal): Promise<PagedResult<Game>> => {
    const url = buildUrl(`${BASE}/rooms/${roomId}/games`, {
      filterCategory: filters.filterCategory,
      filterGameName: filters.filterGameName,
      sortBy: filters.sortBy,
      sortDir: filters.sortDir,
      page: filters.page,
      limit: filters.limit,
    });
    const response = await fetch(url, { signal });
    throwIfNotOk(response);
    const data = (await response.json()) as any;
    return {
      items: (data.games ?? []).map(toGame),
      total: data.total,
    };
  },

  createGame: async (roomId: RoomId, payload: CreateGamePayload, signal: AbortSignal): Promise<Game> => {
    const url = buildUrl(`${BASE}/rooms/${roomId}/games`);
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      signal,
    });
    throwIfNotOk(response);
    const data = (await response.json()) as any;
    return toGame(data.game);
  },

  joinGame: async (gameId: GameId, signal: AbortSignal): Promise<void> => {
    const url = buildUrl(`${BASE}/games/${gameId}/players`);
    const response = await fetch(url, { method: 'POST', signal });
    throwIfNotOk(response);
  },

  leaveGame: async (gameId: GameId, userId: string, signal: AbortSignal): Promise<void> => {
    const url = buildUrl(`${BASE}/games/${gameId}/players/${userId}`);
    const response = await fetch(url, { method: 'DELETE', signal });
    throwIfNotOk(response);
  },

  updateGameStatus: async (gameId: GameId, status: 'game_pending' | 'game_finished', signal: AbortSignal): Promise<Game> => {
    const url = buildUrl(`${BASE}/games/${gameId}`);
    const response = await fetch(url, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
      signal,
    });
    throwIfNotOk(response);
    const data = (await response.json()) as any;
    return toGame(data.game);
  },

  getGameSummary: async (gameId: GameId, signal: AbortSignal): Promise<GameSummary> => {
    const url = buildUrl(`${BASE}/games/${gameId}/summary`);
    const response = await fetch(url, { signal });
    throwIfNotOk(response);
    const data = (await response.json()) as any;
    return toGameSummary(data.summary);
  },

  connectGamePlay: (gameId: GameId, token: string): WebSocket => {
    const origin = window.location.origin.replace(/^https/, 'wss').replace(/^http/, 'ws');
    const url = `${origin}${BASE}/games/${gameId}/play?token=${encodeURIComponent(token)}`;
    return new WebSocket(url);
  },
});
