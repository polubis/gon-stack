import { useContext } from '../context';
import { CountdownTimer } from './countdown-timer';
import { LeaveGameConfirmDialog } from './leave-game-confirm-dialog';
import { QuestionDisplay } from './question-display';
import { ScorePanel } from './score-panel';
import type { Answer } from '../../domain/models';

/* =============================================================================
 * Loading state
 * ============================================================================= */

const LoadingOverlay = () => (
  <div className="absolute inset-0 z-40 flex items-center justify-center bg-[#0b0e1a]/80 backdrop-blur-sm">
    <div className="flex flex-col items-center gap-4">
      <div className="w-12 h-12 rounded-full border-2 border-pink-600/30 border-t-pink-500 animate-spin" />
      <p className="text-sm text-slate-400">Loading…</p>
    </div>
  </div>
);

/* =============================================================================
 * Empty state
 * ============================================================================= */

const WaitingForQuestion = () => (
  <div className="flex-1 flex flex-col items-center justify-center text-center px-8">
    <div className="w-16 h-16 rounded-2xl bg-pink-600/10 border border-pink-500/20 flex items-center justify-center mb-5">
      <svg className="w-7 h-7 text-pink-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
        <circle cx="12" cy="12" r="10" />
        <polyline points="12 6 12 12 16 14" />
      </svg>
    </div>
    <h3 className="text-lg font-bold text-white mb-2">Waiting for next question</h3>
    <p className="text-sm text-slate-400">The game host will start the next question shortly.</p>
  </div>
);

/* =============================================================================
 * GamePlay container
 * ============================================================================= */

export const GamePlay = () => {
  const ctx = useContext();

  const activeQuestion = ctx.useActiveQuestion();
  const remainingSeconds = ctx.useRemainingSeconds();
  const scores = ctx.useScores();
  const isLeaveGameConfirmVisible = ctx.useIsLeaveGameConfirmVisible();
  const isLoading = ctx.useIsLoading();
  const activeGameId = ctx.useActiveGameId();

  const handleSubmit = (questionId: string, answer: Answer) => {
    ctx.submitAnswer(questionId, answer);
  };

  const handleLeaveRequest = () => {
    ctx.requestLeaveGame();
  };

  const handleConfirmLeave = (gameId: NonNullable<typeof activeGameId>, userId: string) => {
    ctx.confirmLeaveGame(gameId, userId);
  };

  const handleCancelLeave = () => {
    ctx.cancelLeaveGame();
  };

  const progressPct = activeQuestion
    ? ((activeQuestion.index) / activeQuestion.total) * 100
    : 0;

  return (
    <div className="relative flex flex-col h-full min-h-0 bg-[#0b0e1a] overflow-hidden">
      {isLoading && <LoadingOverlay />}

      {/* Leave game confirm dialog */}
      {isLeaveGameConfirmVisible && (
        <LeaveGameConfirmDialog
          gameId={activeGameId}
          userId=""
          onConfirm={handleConfirmLeave}
          onCancel={handleCancelLeave}
        />
      )}

      {/* ── Top bar ─────────────────────────────────────────────────── */}
      <header className="flex items-center gap-4 px-5 py-3 bg-[#0d1020] border-b border-white/5 shrink-0">
        {/* Game icon + progress label */}
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-pink-600 to-purple-700 flex items-center justify-center shrink-0">
            <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <rect x="2" y="6" width="20" height="12" rx="3" />
              <path d="M6 12h4M8 10v4" strokeLinecap="round" />
              <circle cx="15" cy="12" r="1.5" fill="currentColor" stroke="none" />
              <circle cx="18" cy="12" r="1.5" fill="currentColor" stroke="none" />
            </svg>
          </div>
          <div className="min-w-0">
            <p className="text-xs text-slate-400 leading-none mb-0.5">Game in progress</p>
            {activeQuestion && (
              <p className="text-sm font-semibold text-white leading-none">
                Question {activeQuestion.index + 1} of {activeQuestion.total}
              </p>
            )}
          </div>
        </div>

        {/* Progress bar */}
        <div className="flex-1 mx-4">
          <div className="flex items-center gap-3">
            <div className="flex-1 h-1.5 rounded-full bg-white/10 overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-pink-600 to-fuchsia-500 transition-all duration-500"
                style={{ width: `${progressPct}%` }}
              />
            </div>
            <span className="text-xs text-slate-400 whitespace-nowrap">
              {Math.round(progressPct)}%
            </span>
          </div>
        </div>

        {/* Leave button */}
        <button
          type="button"
          onClick={handleLeaveRequest}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-red-500/30 bg-red-600/10 text-xs font-semibold text-red-400 hover:bg-red-600/20 hover:text-red-300 transition-all duration-150 shrink-0"
        >
          <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round">
            <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
            <polyline points="16 17 21 12 16 7" />
            <line x1="21" y1="12" x2="9" y2="12" />
          </svg>
          Leave game
        </button>
      </header>

      {/* ── Body ────────────────────────────────────────────────────── */}
      <div className="flex flex-1 min-h-0 overflow-hidden">

        {/* Left sidebar — question index list */}
        {activeQuestion && (
          <aside className="hidden lg:flex flex-col w-48 shrink-0 bg-[#0d1020] border-r border-white/5 overflow-y-auto py-3">
            <p className="px-4 text-[10px] font-semibold uppercase tracking-[0.15em] text-slate-500 mb-2">
              Questions
            </p>
            {Array.from({ length: activeQuestion.total }, (_, i) => {
              const isCurrent = i === activeQuestion.index;
              const isDone = i < activeQuestion.index;
              return (
                <div
                  key={i}
                  className={[
                    'flex items-center gap-2.5 px-4 py-2.5 text-xs font-medium transition-colors',
                    isCurrent
                      ? 'bg-pink-600/15 text-pink-400 border-l-2 border-pink-500'
                      : isDone
                      ? 'text-slate-500 border-l-2 border-transparent'
                      : 'text-slate-600 border-l-2 border-transparent',
                  ].join(' ')}
                >
                  <span
                    className={[
                      'w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0',
                      isCurrent
                        ? 'bg-pink-600 text-white'
                        : isDone
                        ? 'bg-green-600/30 text-green-400'
                        : 'bg-white/5 text-slate-500',
                    ].join(' ')}
                  >
                    {isDone ? '✓' : i + 1}
                  </span>
                  <span>Question {i + 1}</span>
                </div>
              );
            })}
          </aside>
        )}

        {/* Center — main question area */}
        <main className="flex-1 flex flex-col min-h-0 overflow-y-auto">
          <div className="flex-1 px-6 py-6 max-w-2xl mx-auto w-full">
            {activeQuestion ? (
              <>
                {/* Question header row: type badge + timer */}
                <div className="flex items-start justify-between gap-4 mb-6">
                  <div className="flex-1 min-w-0">
                    {/* Question type + answered status shown inside QuestionDisplay */}
                  </div>
                  <CountdownTimer
                    activeQuestion={activeQuestion}
                    remainingSeconds={remainingSeconds}
                  />
                </div>

                <QuestionDisplay
                  activeQuestion={activeQuestion}
                  onSubmit={handleSubmit}
                />
              </>
            ) : (
              <WaitingForQuestion />
            )}
          </div>
        </main>

        {/* Right sidebar — scores */}
        <ScorePanel scores={scores} />
      </div>
    </div>
  );
};
