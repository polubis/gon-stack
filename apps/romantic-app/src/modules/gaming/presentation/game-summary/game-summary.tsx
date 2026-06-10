import { useEffect } from 'react';
import { useContext } from '../context';
import { RankingRow } from './ranking-row';

/* =============================================================================
 * Skeleton
 * ============================================================================= */

const GameSummarySkeleton = () => (
  <div className="flex flex-col gap-6 animate-pulse" aria-busy="true" aria-label="Loading game summary">
    {/* Header skeleton */}
    <div className="flex flex-col gap-3">
      <div className="h-6 w-32 rounded-lg bg-[color-mix(in_srgb,var(--color-surface-200)_60%,transparent)]" />
      <div className="h-10 w-48 rounded-lg bg-[color-mix(in_srgb,var(--color-surface-200)_60%,transparent)]" />
      <div className="flex gap-4">
        <div className="h-16 w-28 rounded-xl bg-[color-mix(in_srgb,var(--color-surface-200)_60%,transparent)]" />
        <div className="h-16 w-28 rounded-xl bg-[color-mix(in_srgb,var(--color-surface-200)_60%,transparent)]" />
        <div className="h-16 w-28 rounded-xl bg-[color-mix(in_srgb,var(--color-surface-200)_60%,transparent)]" />
      </div>
    </div>
    {/* Rankings skeleton */}
    {Array.from({ length: 4 }).map((_, i) => (
      <div
        key={i}
        className="h-14 rounded-xl bg-[color-mix(in_srgb,var(--color-surface-200)_60%,transparent)]"
      />
    ))}
  </div>
);

/* =============================================================================
 * Container
 * ============================================================================= */

export const GameSummary = () => {
  const ctx = useContext();

  const activeGameId = ctx.useActiveGameId();
  const activeRoomId = ctx.useActiveRoomId();
  const gameSummary = ctx.useGameSummary();
  const rankings = ctx.useRankings();
  const isLoading = ctx.useIsLoading();

  useEffect(() => {
    if (activeGameId) {
      ctx.initGameSummary(activeGameId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleBackToGamesWall = () => {
    if (activeRoomId) {
      ctx.initGamesWall(activeRoomId);
    }
  };

  /* ── Top-3 podium data ── */
  const top3 = rankings.slice(0, 3);
  const podiumOrder = [top3[1], top3[0], top3[2]].filter(Boolean);

  const podiumConfig: Record<
    number,
    { height: string; badge: string; badgeText: string; labelColor: string; scoreColor: string }
  > = {
    1: {
      height: 'h-24',
      badge: 'bg-gradient-to-br from-yellow-400 to-amber-500 shadow-[0_0_18px_color-mix(in_srgb,#f59e0b_45%,transparent)]',
      badgeText: 'text-yellow-900',
      labelColor: 'text-yellow-400',
      scoreColor: 'text-yellow-300',
    },
    2: {
      height: 'h-16',
      badge: 'bg-gradient-to-br from-slate-300 to-slate-400 shadow-[0_0_14px_color-mix(in_srgb,#94a3b8_35%,transparent)]',
      badgeText: 'text-slate-700',
      labelColor: 'text-slate-300',
      scoreColor: 'text-slate-200',
    },
    3: {
      height: 'h-12',
      badge: 'bg-gradient-to-br from-amber-600 to-amber-700 shadow-[0_0_14px_color-mix(in_srgb,#b45309_30%,transparent)]',
      badgeText: 'text-amber-100',
      labelColor: 'text-amber-600',
      scoreColor: 'text-amber-400',
    },
  };

  return (
    <main className="min-h-screen page-bg font-sans text-[var(--color-text-primary)] flex flex-col items-center justify-start p-4 md:p-6 lg:p-8">
      <div className="w-full max-w-2xl flex flex-col gap-6">

        {/* ── Back button ── */}
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={handleBackToGamesWall}
            disabled={!activeRoomId}
            className="flex items-center gap-2 variant-button-ghost px-4 py-2 text-sm font-semibold cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <svg
              width="15"
              height="15"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <polyline points="15 18 9 12 15 6" />
            </svg>
            Back to Games Wall
          </button>

          {/* Status pill */}
          <span className="variant-pill variant-pill-secondary text-[11px]">
            Game Finished
          </span>
        </div>

        {isLoading && <GameSummarySkeleton />}

        {!isLoading && gameSummary && (
          <>
            {/* ── Header card ── */}
            <div className="variant-card px-6 py-5 flex flex-col gap-5">
              {/* Title row */}
              <div className="flex items-center gap-3">
                <div className="shrink-0 w-10 h-10 rounded-xl flex items-center justify-center bg-[color-mix(in_srgb,var(--color-primary-500)_22%,transparent)] border border-[color-mix(in_srgb,var(--color-primary-300)_45%,transparent)]">
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="text-[var(--color-primary-300)]"
                    aria-hidden="true"
                  >
                    <path d="M8 21v-2a4 4 0 0 1 4-4h0a4 4 0 0 1 4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                    <path d="M2 21v-2a4 4 0 0 1 4-4" />
                    <path d="M22 21v-2a4 4 0 0 0-4-4" />
                  </svg>
                </div>
                <div>
                  <p className="l2 mb-0.5">Game results</p>
                  <h1 className="t5 leading-none">{gameSummary.gameName}</h1>
                </div>
              </div>

              {/* Stats row */}
              <div className="grid grid-cols-3 gap-3">
                {/* Total questions */}
                <div className="flex flex-col gap-1 px-4 py-3 rounded-xl border border-[color-mix(in_srgb,var(--color-secondary-300)_25%,transparent)] bg-[color-mix(in_srgb,var(--color-surface-200)_35%,transparent)]">
                  <p className="l2 text-[var(--color-text-tertiary)]">Questions</p>
                  <p className="text-2xl font-bold font-heading text-[var(--color-secondary-300)] tabular-nums leading-tight">
                    {gameSummary.totalQuestions}
                  </p>
                  <p className="c2 text-[var(--color-text-tertiary)]">total asked</p>
                </div>

                {/* Total time */}
                <div className="flex flex-col gap-1 px-4 py-3 rounded-xl border border-[color-mix(in_srgb,var(--color-secondary-300)_25%,transparent)] bg-[color-mix(in_srgb,var(--color-surface-200)_35%,transparent)]">
                  <p className="l2 text-[var(--color-text-tertiary)]">Duration</p>
                  <p className="text-2xl font-bold font-heading text-[var(--color-secondary-300)] tabular-nums leading-tight">
                    {gameSummary.totalTimeSeconds}
                    <span className="text-sm font-sans font-medium ml-1 text-[var(--color-text-tertiary)]">s</span>
                  </p>
                  <p className="c2 text-[var(--color-text-tertiary)]">total time</p>
                </div>

                {/* Players ranked */}
                <div className="flex flex-col gap-1 px-4 py-3 rounded-xl border border-[color-mix(in_srgb,var(--color-primary-300)_35%,transparent)] bg-[color-mix(in_srgb,var(--color-primary-500)_10%,transparent)]">
                  <p className="l2 text-[var(--color-text-tertiary)]">Players</p>
                  <p className="text-2xl font-bold font-heading text-[var(--color-primary-300)] tabular-nums leading-tight">
                    {rankings.length}
                  </p>
                  <p className="c2 text-[var(--color-text-tertiary)]">ranked</p>
                </div>
              </div>
            </div>

            {/* ── Podium (top 3) ── */}
            {top3.length > 0 && (
              <div className="variant-card px-6 py-5">
                <p className="l1 text-[var(--color-text-tertiary)] mb-5 flex items-center gap-2">
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="text-yellow-400"
                    aria-hidden="true"
                  >
                    <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
                    <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
                    <path d="M4 22h16" />
                    <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" />
                    <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" />
                    <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" />
                  </svg>
                  Top players
                </p>

                {/* Podium visual */}
                <div className="flex items-end justify-center gap-4">
                  {podiumOrder.map((player) => {
                    if (!player) return null;
                    const cfg = podiumConfig[player.rank];
                    if (!cfg) return null;
                    const initial = player.displayName.charAt(0).toUpperCase();

                    return (
                      <div
                        key={player.userId}
                        className="flex flex-col items-center gap-2"
                      >
                        {/* Avatar with medal indicator */}
                        <div className="relative">
                          <div
                            className={[
                              'w-12 h-12 rounded-full flex items-center justify-center text-base font-bold border-2',
                              cfg.badge,
                              cfg.badgeText,
                            ].join(' ')}
                            aria-label={`Rank ${player.rank}: ${player.displayName}`}
                          >
                            {initial}
                          </div>
                          {player.rank === 1 && (
                            <span
                              className="absolute -top-2 -right-1 text-base leading-none"
                              aria-hidden="true"
                            >
                              👑
                            </span>
                          )}
                        </div>

                        {/* Name */}
                        <p
                          className={[
                            'text-xs font-semibold text-center max-w-[80px] truncate',
                            cfg.labelColor,
                          ].join(' ')}
                        >
                          {player.displayName}
                        </p>

                        {/* Score */}
                        <p className={['text-sm font-bold tabular-nums', cfg.scoreColor].join(' ')}>
                          {player.score.toLocaleString()}
                        </p>

                        {/* Podium block */}
                        <div
                          className={[
                            'w-20 rounded-t-lg border-t border-x flex items-center justify-center',
                            cfg.height,
                            player.rank === 1
                              ? 'border-yellow-400/30 bg-[color-mix(in_srgb,#f59e0b_12%,transparent)]'
                              : player.rank === 2
                                ? 'border-slate-300/25 bg-[color-mix(in_srgb,#94a3b8_10%,transparent)]'
                                : 'border-amber-600/25 bg-[color-mix(in_srgb,#b45309_10%,transparent)]',
                          ].join(' ')}
                        >
                          <span className={['text-2xl font-bold font-heading', cfg.labelColor].join(' ')}>
                            {player.rank}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* ── Full rankings list ── */}
            <div className="variant-card px-6 py-5 flex flex-col gap-3">
              <header className="flex items-center justify-between mb-1">
                <p className="l1 text-[var(--color-text-tertiary)] flex items-center gap-2">
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <line x1="8" y1="6" x2="21" y2="6" />
                    <line x1="8" y1="12" x2="21" y2="12" />
                    <line x1="8" y1="18" x2="21" y2="18" />
                    <line x1="3" y1="6" x2="3.01" y2="6" />
                    <line x1="3" y1="12" x2="3.01" y2="12" />
                    <line x1="3" y1="18" x2="3.01" y2="18" />
                  </svg>
                  Full standings
                </p>
                <span className="c2 text-[var(--color-text-tertiary)]">
                  {rankings.length} player{rankings.length !== 1 ? 's' : ''}
                </span>
              </header>

              {/* Column headers */}
              <div className="grid grid-cols-[2rem_2rem_1fr_5rem_5rem] gap-3 px-4 pb-1 border-b border-[color-mix(in_srgb,var(--color-secondary-300)_15%,transparent)]">
                <span className="l2 text-[var(--color-text-tertiary)] text-center">#</span>
                <span className="l2 text-[var(--color-text-tertiary)]" />
                <span className="l2 text-[var(--color-text-tertiary)]">Player</span>
                <span className="l2 text-[var(--color-text-tertiary)] text-right">Earned</span>
                <span className="l2 text-[var(--color-text-tertiary)] text-right">Score</span>
              </div>

              {/* Rows */}
              {rankings.length === 0 ? (
                <p className="b3 text-[var(--color-text-tertiary)] text-center py-6">
                  No rankings available
                </p>
              ) : (
                <ul className="flex flex-col gap-2" role="list" aria-label="Player rankings">
                  {rankings.map((ranking) => (
                    <li key={ranking.userId}>
                      <RankingRow ranking={ranking} />
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* ── Back to Games Wall CTA ── */}
            <div className="flex justify-center pb-4">
              <button
                type="button"
                onClick={handleBackToGamesWall}
                disabled={!activeRoomId}
                className="variant-button-primary px-8 py-3 text-sm font-semibold font-sans cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2"
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <polyline points="15 18 9 12 15 6" />
                </svg>
                Back to Games Wall
              </button>
            </div>
          </>
        )}

        {!isLoading && !gameSummary && (
          <div className="variant-card flex flex-col items-center gap-4 px-6 py-12 text-center">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center bg-[color-mix(in_srgb,var(--color-surface-200)_50%,transparent)] border border-[color-mix(in_srgb,var(--color-secondary-300)_20%,transparent)]">
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-[var(--color-text-tertiary)]"
                aria-hidden="true"
              >
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
            </div>
            <div>
              <p className="b1 font-semibold text-[var(--color-text-primary)]">
                No summary available
              </p>
              <p className="b3 text-[var(--color-text-tertiary)] mt-1">
                Game results could not be loaded.
              </p>
            </div>
            <button
              type="button"
              onClick={handleBackToGamesWall}
              disabled={!activeRoomId}
              className="variant-button-secondary px-6 py-2 text-sm font-semibold cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Back to Games Wall
            </button>
          </div>
        )}
      </div>
    </main>
  );
};
