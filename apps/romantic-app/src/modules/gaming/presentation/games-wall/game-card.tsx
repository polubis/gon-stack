import type { Game, GameId } from '../../domain/models';

type GameCardProps = {
  game: Game;
  isRoomCreator: boolean;
  onJoin: (gameId: GameId) => void;
  onStart: (gameId: GameId) => void;
};

const STATUS_LABELS: Record<Game['status'], string> = {
  game_waiting: 'Waiting',
  game_pending: 'In progress',
  game_finished: 'Finished',
};

const DIFFICULTY_COLORS: Record<Game['difficulty'], string> = {
  Easy: 'text-[var(--color-success)] border-[color-mix(in_srgb,var(--color-success)_50%,transparent)] bg-[color-mix(in_srgb,var(--color-success)_12%,transparent)]',
  Medium:
    'text-[var(--color-warning)] border-[color-mix(in_srgb,var(--color-warning)_50%,transparent)] bg-[color-mix(in_srgb,var(--color-warning)_12%,transparent)]',
  Hard: 'text-[var(--color-error)] border-[color-mix(in_srgb,var(--color-error)_50%,transparent)] bg-[color-mix(in_srgb,var(--color-error)_12%,transparent)]',
};

const STATUS_COLORS: Record<Game['status'], string> = {
  game_waiting:
    'text-[var(--color-secondary-300)] border-[color-mix(in_srgb,var(--color-secondary-300)_50%,transparent)] bg-[color-mix(in_srgb,var(--color-secondary-500)_14%,transparent)]',
  game_pending:
    'text-[var(--color-warning)] border-[color-mix(in_srgb,var(--color-warning)_50%,transparent)] bg-[color-mix(in_srgb,var(--color-warning)_12%,transparent)]',
  game_finished:
    'text-[var(--color-text-tertiary)] border-[color-mix(in_srgb,var(--color-text-tertiary)_40%,transparent)] bg-[color-mix(in_srgb,var(--color-surface-200)_50%,transparent)]',
};

export const GameCard = ({ game, isRoomCreator, onJoin, onStart }: GameCardProps) => {
  const canJoin = game.status === 'game_waiting' && game.playerCount < game.maxPlayers;
  const canStart = isRoomCreator && game.status === 'game_waiting';

  return (
    <div className="variant-card flex items-center gap-4 px-4 py-3 hover:brightness-110 transition-all duration-150">
      {/* Game icon */}
      <div className="shrink-0 w-10 h-10 rounded-xl flex items-center justify-center bg-[color-mix(in_srgb,var(--color-primary-500)_18%,transparent)] border border-[color-mix(in_srgb,var(--color-primary-300)_40%,transparent)]">
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
        >
          <circle cx="12" cy="12" r="10" />
          <polygon points="10 8 16 12 10 16 10 8" fill="currentColor" stroke="none" />
        </svg>
      </div>

      {/* Game info */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-[var(--color-text-primary)] truncate font-sans">
          {game.name}
        </p>
        <p className="text-xs text-[var(--color-text-tertiary)] truncate mt-0.5">
          {game.category} &middot; {game.timePerQuestion}s per question
        </p>
      </div>

      {/* Difficulty badge */}
      <div
        className={`shrink-0 px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wide border ${DIFFICULTY_COLORS[game.difficulty]}`}
      >
        {game.difficulty}
      </div>

      {/* Player count */}
      <div className="shrink-0 flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[color-mix(in_srgb,var(--color-secondary-500)_15%,transparent)] border border-[color-mix(in_srgb,var(--color-secondary-300)_30%,transparent)]">
        <svg
          width="11"
          height="11"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-[var(--color-secondary-300)]"
        >
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
          <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
        <span className="text-[11px] text-[var(--color-secondary-200)] font-medium">
          {game.playerCount}/{game.maxPlayers}
        </span>
      </div>

      {/* Status badge */}
      <div
        className={`shrink-0 px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wide border ${STATUS_COLORS[game.status]}`}
      >
        {STATUS_LABELS[game.status]}
      </div>

      {/* CTA */}
      {canStart && (
        <button
          type="button"
          onClick={() => onStart(game.id)}
          className="shrink-0 variant-button-primary px-3 py-1.5 text-xs font-semibold font-sans cursor-pointer"
        >
          Start
        </button>
      )}
      {!canStart && canJoin && (
        <button
          type="button"
          onClick={() => onJoin(game.id)}
          className="shrink-0 variant-button-secondary px-3 py-1.5 text-xs font-semibold font-sans cursor-pointer"
        >
          Join
        </button>
      )}
      {!canStart && !canJoin && (
        <div className="shrink-0 w-[62px]" />
      )}
    </div>
  );
};
