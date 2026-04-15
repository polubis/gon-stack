import { applyScoreDelta, resolveRoundDelta } from './engine';
import type { Bus } from './bus';
import type { Store } from './store';

const getLocalScore = (store: Store): number => {
  const localPlayerId = store.$localPlayerId.get();
  const localPlayer = store.$players.get().find((player) => player.playerId === localPlayerId);
  return localPlayer?.score ?? 0;
};

export const resolveCurrentRound = (store: Store, bus: Bus) => {
  if (store.$isReveal.get()) {
    return;
  }

  const localPlayerId = store.$localPlayerId.get();
  const localAnswer = store.$localAnswer.get();
  const partnerAnswer = store.$partnerAnswer.get();
  const winScore = store.$winScore.get();

  if (!localPlayerId) {
    return;
  }

  const delta = resolveRoundDelta(localAnswer, partnerAnswer);
  const players = applyScoreDelta({
    players: store.$players.get(),
    localPlayerId,
    delta,
  });

  store.$players.set(players);
  store.$scoreDeltas.set([...store.$scoreDeltas.get(), delta]);
  store.$isReveal.set(true);
  store.$isRoundLocked.set(true);
  store.$status.set('revealing');
  store.$secondsLeft.set(0);

  bus.emit('[FACT]_ROUND_RESOLVED', {
    localAnswer,
    partnerAnswer,
    delta,
  });

  if (getLocalScore(store) >= winScore) {
    store.$winnerId.set(localPlayerId);
    store.$status.set('finished');
    bus.emit('[FACT]_GAME_COMPLETED', { winnerId: localPlayerId });
  }
};
