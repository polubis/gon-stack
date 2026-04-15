import { atom, computed } from '@/libs/supa-store';
import type {
  AnswerValue,
  CategoryId,
  CategorySummary,
  PlayerId,
  PlayerScore,
  QuizCategory,
  QuizQuestion,
  SessionId,
  SessionStatus,
} from '../domain/models';

export const createStore = () => {
  const $isLoading = atom(false);
  const $error = atom<string | null>(null);
  const $status = atom<SessionStatus>('idle');
  const $sessionId = atom<SessionId | null>(null);
  const $localPlayerId = atom<PlayerId | null>(null);
  const $partnerPlayerId = atom<PlayerId | null>(null);
  const $winScore = atom(10);
  const $players = atom<PlayerScore[]>([]);
  const $categories = atom<QuizCategory[]>([]);
  const $activeCategoryId = atom<CategoryId | null>(null);
  const $askedQuestionIds = atom<string[]>([]);
  const $questionQueue = atom<QuizQuestion[]>([]);
  const $currentQuestionIndex = atom(0);
  const $secondsLeft = atom(0);
  const $isRoundLocked = atom(false);
  const $isReveal = atom(false);
  const $localAnswer = atom<AnswerValue | null>(null);
  const $partnerAnswer = atom<AnswerValue | null>(null);
  const $lastSummary = atom<CategorySummary | null>(null);
  const $winnerId = atom<PlayerId | null>(null);
  const $isConnected = atom(false);
  const $scoreDeltas = atom<number[]>([]);

  return {
    $isLoading,
    $error,
    $status,
    $sessionId,
    $localPlayerId,
    $partnerPlayerId,
    $winScore,
    $players,
    $categories,
    $activeCategoryId,
    $askedQuestionIds,
    $questionQueue,
    $currentQuestionIndex,
    $secondsLeft,
    $isRoundLocked,
    $isReveal,
    $localAnswer,
    $partnerAnswer,
    $lastSummary,
    $winnerId,
    $isConnected,
    $scoreDeltas,
    $activeQuestion: computed(
      [$questionQueue, $currentQuestionIndex],
      (queue, index) => queue[index] ?? null,
    ),
    $hasQuestion: computed(
      [$questionQueue, $currentQuestionIndex],
      (queue, index) => Boolean(queue[index]),
    ),
    $isPaused: computed([$status], (status) => status === 'paused'),
    $isFinished: computed([$status], (status) => status === 'finished'),
    $scoresByPlayerId: computed([$players], (players) =>
      players.reduce<Record<string, number>>((acc, player) => {
        acc[player.playerId] = player.score;
        return acc;
      }, {}),
    ),
  };
};

export type Store = ReturnType<typeof createStore>;
