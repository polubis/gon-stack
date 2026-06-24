import { atom, computed } from '@/libs/supa-store';
import type {
  Category,
  CategoryId,
  CategoryStats,
  GamePhase,
  Player,
  PlayerAnswer,
  PlayerId,
  Question,
  RoundResult,
} from '../contracts/models';

const INITIAL_WIN_THRESHOLD = 10;

export const createStore = () => {
  const $phase = atom<GamePhase>('category_selection');
  // TODO: resume should return to the phase captured before pause. Tracking in $phasePrePause.
  const $phasePrePause = atom<GamePhase | null>(null);

  const $player1 = atom<Player>({
    id: 'p1' as PlayerId,
    name: 'You',
    score: 0,
  });
  const $player2 = atom<Player>({
    id: 'p2' as PlayerId,
    name: 'Partner',
    score: 0,
  });
  const $winThreshold = atom(INITIAL_WIN_THRESHOLD);
  const $isPaused = atom(false);

  const $categories = atom<Category[]>([]);
  const $selectedCategoryId = atom<CategoryId | null>(null);

  const $questions = atom<Question[]>([]);
  const $currentQuestionIndex = atom(0);
  const $isLoadingQuestions = atom(false);
  const $error = atom<string | null>(null);

  const $player1Answer = atom<PlayerAnswer | null>(null);
  const $player2Answer = atom<PlayerAnswer | null>(null);
  const $timerRemaining = atom(0);
  const $timerTotal = atom(0);

  const $roundResults = atom<RoundResult[]>([]);
  const $winnerId = atom<PlayerId | null>(null);

  const $currentQuestion = computed(
    [$questions, $currentQuestionIndex],
    (questions, index) => questions[index] ?? null,
  );

  const $hasMoreQuestions = computed(
    [$questions, $currentQuestionIndex],
    (questions, index) => index < questions.length - 1,
  );

  const $bothAnswered = computed(
    [$player1Answer, $player2Answer],
    (a1, a2) => a1 !== null && a2 !== null,
  );

  const $latestResult = computed(
    [$roundResults],
    (results) => results[results.length - 1] ?? null,
  );

  const $selectedCategory = computed(
    [$categories, $selectedCategoryId],
    (cats: Category[], id: CategoryId | null) =>
      id ? (cats.find((c) => c.id === id) ?? null) : null,
  );

  const $timerPercent = computed(
    [$timerRemaining, $timerTotal],
    (remaining, total) => (total > 0 ? (remaining / total) * 100 : 100),
  );

  const $categoryStats = computed(
    [$roundResults, $selectedCategoryId, $questions],
    (
      results: RoundResult[],
      catId: CategoryId | null,
      questions: Question[],
    ): CategoryStats | null => {
      if (!catId) return null;
      const catResults = results.filter((r) => r.categoryId === catId);
      const totalQuestions = questions.length || catResults.length;
      const matched = catResults.filter((r) => r.result === 'match').length;
      const mismatched = catResults.filter(
        (r) => r.result === 'mismatch',
      ).length;
      const skipped = catResults.filter((r) => r.result === 'no_answer').length;
      const answered = matched + mismatched;
      const compatibilityPercent =
        answered > 0 ? Math.round((matched / answered) * 100) : 0;
      return {
        categoryId: catId,
        totalQuestions,
        answered,
        matched,
        mismatched,
        skipped,
        compatibilityPercent,
      };
    },
  );

  const $hasError = computed([$error], (e) => Boolean(e));

  return {
    $phase,
    $phasePrePause,
    $player1,
    $player2,
    $winThreshold,
    $isPaused,
    $categories,
    $selectedCategoryId,
    $questions,
    $currentQuestionIndex,
    $isLoadingQuestions,
    $error,
    $player1Answer,
    $player2Answer,
    $timerRemaining,
    $timerTotal,
    $roundResults,
    $winnerId,
    $currentQuestion,
    $hasMoreQuestions,
    $bothAnswered,
    $latestResult,
    $selectedCategory,
    $timerPercent,
    $categoryStats,
    $hasError,
  };
};

export type Store = ReturnType<typeof createStore>;
