import type { PlayerRanking } from '../../domain/models';

type RankingRowProps = {
  ranking: PlayerRanking;
};

const MEDAL_CONFIG: Record<
  number,
  { icon: string; bg: string; border: string; text: string; glow: string }
> = {
  1: {
    icon: '🥇',
    bg: 'bg-[color-mix(in_srgb,#f59e0b_14%,transparent)]',
    border: 'border-[color-mix(in_srgb,#f59e0b_45%,transparent)]',
    text: 'text-yellow-400',
    glow: 'shadow-[0_0_10px_color-mix(in_srgb,#f59e0b_30%,transparent)]',
  },
  2: {
    icon: '🥈',
    bg: 'bg-[color-mix(in_srgb,#94a3b8_12%,transparent)]',
    border: 'border-[color-mix(in_srgb,#94a3b8_40%,transparent)]',
    text: 'text-slate-300',
    glow: 'shadow-[0_0_8px_color-mix(in_srgb,#94a3b8_20%,transparent)]',
  },
  3: {
    icon: '🥉',
    bg: 'bg-[color-mix(in_srgb,#b45309_14%,transparent)]',
    border: 'border-[color-mix(in_srgb,#b45309_45%,transparent)]',
    text: 'text-amber-600',
    glow: 'shadow-[0_0_8px_color-mix(in_srgb,#b45309_20%,transparent)]',
  },
};

const DEFAULT_MEDAL = {
  icon: null,
  bg: 'bg-[color-mix(in_srgb,var(--color-surface-200)_40%,transparent)]',
  border: 'border-[color-mix(in_srgb,var(--color-secondary-300)_20%,transparent)]',
  text: 'text-[var(--color-text-tertiary)]',
  glow: '',
};

export const RankingRow = ({ ranking }: RankingRowProps) => {
  const config = MEDAL_CONFIG[ranking.rank] ?? DEFAULT_MEDAL;
  const initial = ranking.displayName.charAt(0).toUpperCase();
  const isTopThree = ranking.rank <= 3;

  return (
    <div
      className={[
        'flex items-center gap-3 px-4 py-3 rounded-xl border transition-all duration-150',
        config.bg,
        config.border,
        config.glow,
        isTopThree ? 'hover:brightness-110' : 'hover:bg-[color-mix(in_srgb,var(--color-surface-200)_50%,transparent)]',
      ].join(' ')}
    >
      {/* Rank indicator */}
      <div className="shrink-0 w-8 flex items-center justify-center">
        {isTopThree ? (
          <span className="text-lg leading-none" aria-label={`Rank ${ranking.rank}`}>
            {config.icon}
          </span>
        ) : (
          <span className={`text-sm font-bold tabular-nums ${config.text}`}>
            {ranking.rank}
          </span>
        )}
      </div>

      {/* Avatar */}
      <div
        className={[
          'shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold select-none border',
          isTopThree
            ? `${config.border} bg-[color-mix(in_srgb,var(--color-primary-500)_28%,transparent)] text-[var(--color-primary-200)]`
            : 'border-[color-mix(in_srgb,var(--color-secondary-300)_30%,transparent)] bg-[color-mix(in_srgb,var(--color-secondary-500)_18%,transparent)] text-[var(--color-secondary-200)]',
        ].join(' ')}
        aria-hidden="true"
      >
        {initial}
      </div>

      {/* Display name */}
      <span className="flex-1 min-w-0 text-sm font-medium text-[var(--color-text-primary)] truncate font-sans">
        {ranking.displayName}
      </span>

      {/* Points earned */}
      <div className="shrink-0 flex flex-col items-end">
        <span className="text-[10px] uppercase tracking-wide font-medium text-[var(--color-text-tertiary)] leading-none mb-0.5">
          Earned
        </span>
        <span
          className={[
            'text-xs font-bold tabular-nums',
            isTopThree ? config.text : 'text-[var(--color-text-secondary)]',
          ].join(' ')}
        >
          +{ranking.pointsEarned.toLocaleString()}
        </span>
      </div>

      {/* Score */}
      <div className="shrink-0 flex flex-col items-end min-w-[4.5rem]">
        <span className="text-[10px] uppercase tracking-wide font-medium text-[var(--color-text-tertiary)] leading-none mb-0.5">
          Score
        </span>
        <span
          className={[
            'text-sm font-bold tabular-nums',
            isTopThree
              ? `${config.text}`
              : 'text-[var(--color-text-primary)]',
          ].join(' ')}
        >
          {ranking.score.toLocaleString()}
        </span>
      </div>
    </div>
  );
};
