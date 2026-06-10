import type {
  Answer,
  GameId,
  RoomId,
} from '../domain/models';
import type { CreateGamePayload, CreateRoomPayload, GamesFilter, JoinRoomPayload, ParticipantsFilter } from './ports/repository';
import type { Registry } from './registry';
import type { Store } from './store';

export const createFacade = (store: Store, trigger: Registry['trigger']) => {
  return {
    init: () => trigger('[TRIGGER]_ROOMS_WALL_INIT'),
    openCreateRoom: () => trigger('[TRIGGER]_CREATE_ROOM_OPEN'),
    submitCreateRoom: (payload: CreateRoomPayload) =>
      trigger('[TRIGGER]_CREATE_ROOM_SUBMIT', payload),
    openJoinRoom: () => trigger('[TRIGGER]_JOIN_ROOM_OPEN'),
    submitJoinRoom: (payload: { roomId: RoomId } & JoinRoomPayload) =>
      trigger('[TRIGGER]_JOIN_ROOM_SUBMIT', {
        roomId: payload.roomId,
        roomCode: payload.roomCode,
        roomPassword: payload.roomPassword,
      }),
    initGamesWall: (roomId: RoomId) =>
      trigger('[TRIGGER]_GAMES_WALL_INIT', { roomId }),
    applyGameFilters: (filters: GamesFilter) => {
      store.$gameFilters.set(filters);
      const roomId = store.$activeRoomId.get();
      if (roomId) trigger('[TRIGGER]_GAMES_WALL_INIT', { roomId: roomId as RoomId });
    },
    applyParticipantFilters: (filters: ParticipantsFilter) => {
      store.$participantFilters.set(filters);
      const roomId = store.$activeRoomId.get();
      if (roomId) trigger('[TRIGGER]_GAMES_WALL_INIT', { roomId: roomId as RoomId });
    },
    openCreateGame: () => trigger('[TRIGGER]_CREATE_GAME_OPEN'),
    submitCreateGame: (payload: CreateGamePayload) =>
      trigger('[TRIGGER]_CREATE_GAME_SUBMIT', payload),
    joinGame: (gameId: GameId) => trigger('[TRIGGER]_JOIN_GAME', { gameId }),
    startGame: (gameId: GameId) => trigger('[TRIGGER]_START_GAME', { gameId }),
    removeParticipant: (roomId: RoomId, userId: string) =>
      trigger('[TRIGGER]_REMOVE_PARTICIPANT', { roomId, userId }),
    submitAnswer: (questionId: string, answer: Answer) =>
      trigger('[TRIGGER]_SUBMIT_ANSWER', { questionId, answer }),
    requestLeaveGame: () => trigger('[TRIGGER]_LEAVE_GAME_REQUEST'),
    confirmLeaveGame: (gameId: GameId, userId: string) =>
      trigger('[TRIGGER]_LEAVE_GAME_CONFIRM', { gameId, userId }),
    cancelLeaveGame: () => trigger('[TRIGGER]_LEAVE_GAME_CANCEL'),
    initGameSummary: (gameId: GameId) =>
      trigger('[TRIGGER]_GAME_SUMMARY_INIT', { gameId }),

    useRooms: () => store.$rooms.use(),
    useRoomsTotal: () => store.$roomsTotal.use(),
    useIsCreateRoomOpen: () => store.$isCreateRoomOpen.use(),
    useIsJoinRoomOpen: () => store.$isJoinRoomOpen.use(),
    useGames: () => store.$games.use(),
    useGamesTotal: () => store.$gamesTotal.use(),
    useGameFilters: () => store.$gameFilters.use(),
    useParticipants: () => store.$participants.use(),
    useParticipantsTotal: () => store.$participantsTotal.use(),
    useParticipantFilters: () => store.$participantFilters.use(),
    useIsCreateGameOpen: () => store.$isCreateGameOpen.use(),
    useIsRoomCreator: () => store.$isRoomCreator.use(),
    useActiveQuestion: () => store.$activeQuestion.use(),
    useRemainingSeconds: () => store.$remainingSeconds.use(),
    useScores: () => store.$scores.use(),
    useGameStatus: () => store.$gameStatus.use(),
    useIsLeaveGameConfirmVisible: () => store.$isLeaveGameConfirmVisible.use(),
    useGameSummary: () => store.$gameSummary.use(),
    useRankings: () => store.$rankings.use(),
    useIsLoading: () => store.$isLoading.use(),
    useError: () => store.$error.use(),
    useHasError: () => store.$hasError.use(),
    useActiveRoomId: () => store.$activeRoomId.use(),
    useActiveGameId: () => store.$activeGameId.use(),
    useCurrentUserId: () => store.$currentUserId.use(),
  };
};

export type Facade = ReturnType<typeof createFacade>;
