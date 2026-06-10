import type { PlayerScore } from '../../domain/models';

/* =============================================================================
 * Public Props
 * ============================================================================= */

export type ScorePanelProps = {
  scores: PlayerScore[];
};

/* =============================================================================
 * Helpers
 * ============================================================================= */

const RANK_COLORS: Record<number, string> = {
  1: 'text-yellow-400',
  2: 'text-slate-300',
  3: 'text-amber-600',
};

const RANK_BG: Record<number, string> = {
  1: 'bg-yellow-400/10 border-yellow-400/20',
  2: 'bg-slate-300/10 border-slate-300/20',
  3: 'bg-amber-600/10 border-amber-600/20',
};

/* =============================================================================
 * Component
 * ============================================================================= */

export const ScorePanel = ({ scores }: ScorePanelProps) => {
  const sorted = [...scores].sort((a, b) => b.score - a.score);

  return (
    <aside className="flex flex-col h-full bg-[#12152a] border-l border-white/5 w-56 shrink-0">
      {/* Header */}
      <div className="px-4 py-3 border-b border-white/5">
        <h2 className="text-xs font-semibold uppercase tracking-[0.15em] text-slate-400">
          Scoreboard
        </h2>
      </div>

      {/* Score list */}
      <div className="flex-1 overflow-y-auto py-2 space-y-1 px-2">
        {sorted.length === 0 && (
          <p className="text-xs text-slate-500 text-center py-4">No scores yet</p>
        )}
        {sorted.map((player, index) => {
          const rank = index + 1;
          const rankColor = RANK_COLORS[rank] ?? 'text-slate-500';
          const rankBg = RANK_BG[rank] ?? 'bg-white/5 border-white/5';

          return (
            <div
              key={player.userId}
              className={[
                'flex items-center gap-2.5 px-2.5 py-2 rounded-lg border',
                rankBg,
              ].join(' ')}
            >
              {/* Rank badge */}
              <span
                className={[
                  'w-5 h-5 flex items-center justify-center rounded-full text-[10px] font-bold shrink-0',
                  rankColor,
                  rank <= 3 ? 'border border-current' : 'text-slate-500',
                ].join(' ')}
              >
                {rank}
              </span>

              {/* Avatar initials */}
              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-pink-600 to-purple-700 flex items-center justify-center shrink-0">
                <span className="text-[10px] font-bold text-white uppercase">
                  {player.displayName.slice(0, 2)}
                </span>
              </div>

              {/* Name + score */}
              <div className="flex-1 min-w-0">
                <p className="text-[11px] font-medium text-white truncate leading-tight">
                  {player.displayName}
                </p>
                <p className={['text-[11px] font-bold', rankColor].join(' ')}>
                  {player.score.toLocaleString()} pts
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer hint */}
      <div className="px-4 py-3 border-t border-white/5">
        <p className="text-[10px] text-slate-600 text-center">Updates live</p>
      </div>
    </aside>
  );
};
