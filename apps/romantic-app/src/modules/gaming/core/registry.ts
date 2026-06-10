import { createBus } from './bus';
import { createGameOpen } from './handlers/create-game-open';
import { createGameSubmit } from './handlers/create-game-submit';
import { createGameSuccess } from './handlers/create-game-success';
import { createRoomOpen } from './handlers/create-room-open';
import { createRoomSubmit } from './handlers/create-room-submit';
import { createRoomSuccess } from './handlers/create-room-success';
import { gameSummaryInit } from './handlers/game-summary-init';
import { gamesWallInit } from './handlers/games-wall-init';
import { joinGame } from './handlers/join-game';
import { joinGameSuccess } from './handlers/join-game-success';
import { joinRoomOpen } from './handlers/join-room-open';
import { joinRoomSubmit } from './handlers/join-room-submit';
import { joinRoomSuccess } from './handlers/join-room-success';
import { leaveGameCancel } from './handlers/leave-game-cancel';
import { leaveGameConfirm } from './handlers/leave-game-confirm';
import { leaveGameRequest } from './handlers/leave-game-request';
import { removeParticipant } from './handlers/remove-participant';
import { roomsWallInit } from './handlers/rooms-wall-init';
import { startGame } from './handlers/start-game';
import { submitAnswer } from './handlers/submit-answer';
import { wsConnect } from './handlers/ws-connect';
import { wsGameEnded } from './handlers/ws-game-ended';
import { wsGameStateChanged } from './handlers/ws-game-state-changed';
import { wsQuestionStarted } from './handlers/ws-question-started';
import { wsScoresUpdated } from './handlers/ws-scores-updated';
import { wsTimerTicked } from './handlers/ws-timer-ticked';
import type { IRepository } from './ports/repository';
import type { Store } from './store';

export const createRegistry = (store: Store, repository: IRepository) => {
  const bus = createBus();

  const register = bus.createRegistry(
    roomsWallInit(store, bus, repository),
    createRoomOpen(store, bus, repository),
    createRoomSubmit(store, bus, repository),
    createRoomSuccess(store, bus, repository),
    joinRoomOpen(store, bus, repository),
    joinRoomSubmit(store, bus, repository),
    joinRoomSuccess(store, bus, repository),
    gamesWallInit(store, bus, repository),
    createGameOpen(store, bus, repository),
    createGameSubmit(store, bus, repository),
    createGameSuccess(store, bus, repository),
    joinGame(store, bus, repository),
    joinGameSuccess(store, bus, repository),
    startGame(store, bus, repository),
    removeParticipant(store, bus, repository),
    leaveGameConfirm(store, bus, repository),
    gameSummaryInit(store, bus, repository),
    wsConnect(store, bus, repository),
    submitAnswer(store, bus),
    leaveGameRequest(store, bus),
    leaveGameCancel(store, bus),
    wsQuestionStarted(store, bus),
    wsTimerTicked(store, bus),
    wsScoresUpdated(store, bus),
    wsGameStateChanged(store, bus),
    wsGameEnded(store, bus),
  );

  return { trigger: bus.trigger, register };
};

export type Registry = ReturnType<typeof createRegistry>;
