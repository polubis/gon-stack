import { atom, computed } from '@/libs/supa-store';
import type {
  ActiveQuestion,
  Game,
  GameId,
  GamePlayState,
  GameSummary,
  Participant,
  PlayerScore,
  Room,
  RoomId,
} from '../domain/models';
import type { GamesFilter, ParticipantsFilter } from './ports/repository';

export const createStore = () => {
  const $isLoading = atom(false);
  const $error = atom<string | null>(null);

  const $rooms = atom<Room[]>([]);
  const $roomsTotal = atom(0);
  const $isCreateRoomOpen = atom(false);
  const $isJoinRoomOpen = atom(false);

  const $activeRoomId = atom<RoomId | null>(null);
  const $activeRoom = atom<Room | null>(null);
  const $games = atom<Game[]>([]);
  const $gamesTotal = atom(0);
  const $participants = atom<Participant[]>([]);
  const $participantsTotal = atom(0);
  const $isCreateGameOpen = atom(false);
  const $gameFilters = atom<GamesFilter>({});
  const $participantFilters = atom<ParticipantsFilter>({});

  const $gamePlayState = atom<GamePlayState | null>(null);
  const $isLeaveGameConfirmVisible = atom(false);
  const $ws = atom<WebSocket | null>(null);

  const $gameSummary = atom<GameSummary | null>(null);

  const $currentUserId = atom<string | null>(null);

  return {
    $isLoading,
    $error,
    $rooms,
    $roomsTotal,
    $isCreateRoomOpen,
    $isJoinRoomOpen,
    $activeRoomId,
    $activeRoom,
    $games,
    $gamesTotal,
    $participants,
    $participantsTotal,
    $isCreateGameOpen,
    $gameFilters,
    $participantFilters,
    $gamePlayState,
    $isLeaveGameConfirmVisible,
    $ws,
    $gameSummary,
    $currentUserId,
    $hasError: computed($error, (error) => Boolean(error)),
    $activeQuestion: computed(
      $gamePlayState,
      (s): ActiveQuestion | null => s?.activeQuestion ?? null,
    ),
    $remainingSeconds: computed(
      $gamePlayState,
      (s) => s?.activeQuestion?.remainingSeconds ?? 0,
    ),
    $scores: computed($gamePlayState, (s): PlayerScore[] => s?.scores ?? []),
    $gameStatus: computed(
      $gamePlayState,
      (s): 'game_pending' | 'game_finished' | null => s?.status ?? null,
    ),
    $rankings: computed($gameSummary, (s) => s?.rankings ?? []),
    $isRoomCreator: computed(
      [$activeRoom, $currentUserId],
      (room, uid) => room?.creatorId === uid,
    ),
    $activeGameId: computed(
      $gamePlayState,
      (s): GameId | null => s?.gameId ?? null,
    ),
  };
};

export type Store = ReturnType<typeof createStore>;
