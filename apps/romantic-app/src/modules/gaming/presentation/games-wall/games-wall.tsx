import { useEffect, useState } from 'react';
import { useContext } from '../context';
import type { Game, GameId, Participant, RoomId } from '../../domain/models';
import type { GamesFilter, ParticipantsFilter } from '../../core/ports/repository';
import { GameCard } from './game-card';
import { ParticipantRow } from './participant-row';
import { CreateGameModal } from './create-game-modal';

/* ─────────────────────── sub-components ─────────────────────── */

type GameFiltersBarProps = {
  filters: GamesFilter;
  onApply: (filters: GamesFilter) => void;
};

const GameFiltersBar = ({ filters, onApply }: GameFiltersBarProps) => {
  const [name, setName] = useState(filters.filterGameName ?? '');
  const [category, setCategory] = useState(filters.filterCategory ?? '');
  const [sortBy, setSortBy] = useState<GamesFilter['sortBy']>(filters.sortBy ?? 'order');
  const [sortDir, setSortDir] = useState<GamesFilter['sortDir']>(filters.sortDir ?? 'asc');

  const handleApply = () => {
    onApply({
      filterGameName: name || undefined,
      filterCategory: category || undefined,
      sortBy,
      sortDir,
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleApply();
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      {/* Name search */}
      <div className="relative flex-1 min-w-[160px] max-w-xs">
        <svg
          width="13"
          height="13"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-tertiary)] pointer-events-none"
        >
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
        <input
          type="text"
          placeholder="Search games…"
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={handleKeyDown}
          className="variant-input pl-9 pr-3 py-1.5 text-xs rounded-xl w-full"
        />
      </div>

      {/* Category filter */}
      <input
        type="text"
        placeholder="Filter category…"
        value={category}
        onChange={(e) => setCategory(e.target.value)}
        onKeyDown={handleKeyDown}
        className="variant-input px-3 py-1.5 text-xs rounded-xl min-w-[140px] max-w-xs flex-1"
      />

      {/* Sort */}
      <select
        value={sortBy}
        onChange={(e) => setSortBy(e.target.value as GamesFilter['sortBy'])}
        className="variant-input px-3 py-1.5 text-xs rounded-xl appearance-none cursor-pointer"
      >
        <option value="order">Default order</option>
        <option value="game_name">Name</option>
        <option value="category">Category</option>
      </select>

      <button
        type="button"
        onClick={() => setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))}
        title={sortDir === 'asc' ? 'Ascending' : 'Descending'}
        className="variant-icon-button cursor-pointer"
      >
        <svg
          width="13"
          height="13"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={`text-[var(--color-secondary-300)] transition-transform ${sortDir === 'desc' ? 'rotate-180' : ''}`}
        >
          <line x1="12" y1="5" x2="12" y2="19" />
          <polyline points="19 12 12 5 5 12" />
        </svg>
      </button>

      <button
        type="button"
        onClick={handleApply}
        className="variant-button-secondary px-3 py-1.5 text-xs font-semibold font-sans cursor-pointer rounded-xl"
      >
        Apply
      </button>
    </div>
  );
};

/* ─── */

type ParticipantFiltersBarProps = {
  filters: ParticipantsFilter;
  onApply: (filters: ParticipantsFilter) => void;
};

const ParticipantFiltersBar = ({ filters, onApply }: ParticipantFiltersBarProps) => {
  const [name, setName] = useState(filters.filterUserName ?? '');
  const [sortDir, setSortDir] = useState<ParticipantsFilter['sortDir']>(filters.sortDir ?? 'asc');

  const handleApply = () => {
    onApply({
      filterUserName: name || undefined,
      sortBy: 'user_name',
      sortDir,
    });
  };

  return (
    <div className="flex items-center gap-2">
      <div className="relative flex-1">
        <svg
          width="12"
          height="12"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[var(--color-text-tertiary)] pointer-events-none"
        >
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
        <input
          type="text"
          placeholder="Search players…"
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleApply()}
          className="variant-input pl-8 pr-2.5 py-1.5 text-[11px] rounded-lg w-full"
        />
      </div>
      <button
        type="button"
        onClick={() => {
          const next = sortDir === 'asc' ? 'desc' : 'asc';
          setSortDir(next);
          onApply({ filterUserName: name || undefined, sortBy: 'user_name', sortDir: next });
        }}
        title={sortDir === 'asc' ? 'A → Z' : 'Z → A'}
        className="shrink-0 variant-icon-button w-8 h-8 cursor-pointer"
      >
        <svg
          width="12"
          height="12"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={`text-[var(--color-secondary-300)] transition-transform ${sortDir === 'desc' ? 'rotate-180' : ''}`}
        >
          <line x1="12" y1="5" x2="12" y2="19" />
          <polyline points="19 12 12 5 5 12" />
        </svg>
      </button>
    </div>
  );
};

/* ─── Games empty state ─── */

type GamesEmptyProps = { onCreateGame: () => void; isRoomCreator: boolean };

const GamesEmpty = ({ onCreateGame, isRoomCreator }: GamesEmptyProps) => (
  <div className="flex flex-col items-center justify-center py-16 gap-4">
    <div className="w-14 h-14 rounded-2xl flex items-center justify-center bg-[color-mix(in_srgb,var(--color-primary-500)_14%,transparent)] border border-[color-mix(in_srgb,var(--color-primary-300)_30%,transparent)]">
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="text-[var(--color-primary-300)]"
      >
        <circle cx="12" cy="12" r="10" />
        <polygon points="10 8 16 12 10 16 10 8" fill="currentColor" stroke="none" />
      </svg>
    </div>
    <p className="text-sm text-[var(--color-text-tertiary)] text-center max-w-[220px]">
      No games yet. Be the first to create one!
    </p>
    {isRoomCreator && (
      <button
        type="button"
        onClick={onCreateGame}
        className="variant-button-primary px-4 py-2 text-xs font-semibold font-sans cursor-pointer"
      >
        Create game
      </button>
    )}
  </div>
);

/* ─────────────────────── container ─────────────────────── */

export const GamesWall = () => {
  const ctx = useContext();

  const games = ctx.useGames();
  const participants = ctx.useParticipants();
  const isLoading = ctx.useIsLoading();
  const isCreateGameOpen = ctx.useIsCreateGameOpen();
  const gameFilters = ctx.useGameFilters();
  const participantFilters = ctx.useParticipantFilters();
  const isRoomCreator = ctx.useIsRoomCreator();
  const error = ctx.useError();
  const activeRoomId = ctx.useActiveRoomId();

  // Track local dismiss so the user can close the modal without a dedicated
  // facade action. Reset whenever the facade re-opens the modal.
  const [localModalClosed, setLocalModalClosed] = useState(false);
  useEffect(() => {
    if (isCreateGameOpen) setLocalModalClosed(false);
  }, [isCreateGameOpen]);

  useEffect(() => {
    if (activeRoomId) ctx.initGamesWall(activeRoomId);
  }, [activeRoomId]);

  return (
    <div className="flex flex-col h-full min-h-0">
      {/* Top bar */}
      <div className="flex items-center justify-between gap-4 px-6 py-4 border-b border-[color-mix(in_srgb,var(--color-primary-500)_20%,transparent)]">
        <div>
          <h1 className="text-lg font-bold font-heading text-[var(--color-text-primary)]">
            Games
          </h1>
          <p className="text-xs text-[var(--color-text-tertiary)] mt-0.5">
            Create a game or join one to start playing.
          </p>
        </div>
        {isRoomCreator && (
          <button
            type="button"
            onClick={ctx.openCreateGame}
            className="variant-button-primary px-4 py-2 text-sm font-semibold font-sans cursor-pointer shrink-0 flex items-center gap-2"
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Create game
          </button>
        )}
      </div>

      {/* Error banner */}
      {error && (
        <div className="mx-6 mt-4 px-4 py-2.5 rounded-xl border border-[color-mix(in_srgb,var(--color-error)_45%,transparent)] bg-[color-mix(in_srgb,var(--color-error)_10%,transparent)] text-sm text-[var(--color-error)]">
          {error}
        </div>
      )}

      {/* Main layout: games + sidebar */}
      <div className="flex flex-1 min-h-0 gap-0">
        {/* Games column */}
        <div className="flex-1 min-w-0 flex flex-col gap-4 p-6 overflow-y-auto">
          {/* Filters */}
          <GameFiltersBar filters={gameFilters} onApply={ctx.applyGameFilters} />

          {/* Loading */}
          {isLoading && (
            <div className="flex items-center justify-center py-10">
              <div className="w-7 h-7 rounded-full border-2 border-[var(--color-primary-400)] border-t-transparent animate-spin" />
            </div>
          )}

          {/* Games list */}
          {!isLoading && games.length === 0 && (
            <GamesEmpty onCreateGame={ctx.openCreateGame} isRoomCreator={isRoomCreator} />
          )}

          {!isLoading && games.length > 0 && (
            <div className="flex flex-col gap-2">
              {games.map((game: Game) => (
                <GameCard
                  key={game.id}
                  game={game}
                  isRoomCreator={isRoomCreator}
                  onJoin={(id: GameId) => ctx.joinGame(id)}
                  onStart={(id: GameId) => ctx.startGame(id)}
                />
              ))}
            </div>
          )}
        </div>

        {/* Participants sidebar */}
        <div className="w-64 shrink-0 border-l border-[color-mix(in_srgb,var(--color-primary-500)_15%,transparent)] flex flex-col">
          {/* Sidebar header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-[color-mix(in_srgb,var(--color-primary-500)_15%,transparent)]">
            <div className="flex items-center gap-2">
              <svg
                width="14"
                height="14"
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
              <span className="text-xs font-semibold text-[var(--color-text-secondary)] uppercase tracking-wide">
                Players
              </span>
            </div>
            <span className="variant-pill variant-pill-secondary">
              {participants.length}
            </span>
          </div>

          {/* Participant search */}
          <div className="px-3 py-2 border-b border-[color-mix(in_srgb,var(--color-primary-500)_12%,transparent)]">
            <ParticipantFiltersBar
              filters={participantFilters}
              onApply={ctx.applyParticipantFilters}
            />
          </div>

          {/* Participant list */}
          <div className="flex-1 overflow-y-auto py-1">
            {participants.length === 0 ? (
              <p className="text-xs text-[var(--color-text-tertiary)] text-center py-8 px-3">
                No players yet.
              </p>
            ) : (
              participants.map((p: Participant) => (
                <ParticipantRow
                  key={p.userId}
                  participant={p}
                  activeRoomId={activeRoomId as RoomId}
                  isRoomCreator={isRoomCreator}
                  onRemove={ctx.removeParticipant}
                />
              ))
            )}
          </div>
        </div>
      </div>

      {/* Create game modal — isCreateGameOpen is the authoritative open signal.
          The modal becomes invisible (isOpen=false) either when the facade sets
          $isCreateGameOpen to false (on success) or when the user dismisses it
          via the local forceClose toggle. */}
      <CreateGameModal
        isOpen={isCreateGameOpen && !localModalClosed}
        isLoading={isLoading}
        onSubmit={(payload) => {
          setLocalModalClosed(false);
          ctx.submitCreateGame(payload);
        }}
        onClose={() => setLocalModalClosed(true)}
      />
    </div>
  );
};
