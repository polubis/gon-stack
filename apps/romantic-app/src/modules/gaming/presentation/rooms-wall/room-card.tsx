import type { Room } from '../../domain/models';

type RoomCardProps = {
  room: Room;
  onJoin: (room: Room) => void;
};

export const RoomCard = ({ room, onJoin }: RoomCardProps) => {
  const isPublic = room.visibility === 'public';

  return (
    <div className="variant-card flex items-center gap-4 px-4 py-3 hover:brightness-110 transition-all duration-150">
      {/* Room icon */}
      <div className="shrink-0 w-9 h-9 rounded-xl flex items-center justify-center bg-[color-mix(in_srgb,var(--color-primary-500)_18%,transparent)] border border-[color-mix(in_srgb,var(--color-primary-300)_40%,transparent)]">
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-[var(--color-primary-300)]"
        >
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
          <polyline points="9 22 9 12 15 12 15 22" />
        </svg>
      </div>

      {/* Room info */}
      <div className="flex-1 min-w-0">
        <p className="b2 font-semibold text-[var(--color-text-primary)] truncate">{room.name}</p>
        <p className="c1 text-[var(--color-text-tertiary)] truncate">
          Code: <span className="font-mono text-[var(--color-secondary-300)]">{room.code}</span>
        </p>
      </div>

      {/* Participants */}
      <div className="shrink-0 flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[color-mix(in_srgb,var(--color-secondary-500)_15%,transparent)] border border-[color-mix(in_srgb,var(--color-secondary-300)_30%,transparent)]">
        <svg
          width="12"
          height="12"
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
        <span className="c1 text-[var(--color-secondary-200)] font-medium">
          {room.participantCount}
        </span>
      </div>

      {/* Visibility badge */}
      <div
        className={`shrink-0 variant-pill text-[10px] ${
          isPublic ? '' : 'variant-pill-secondary'
        }`}
      >
        {isPublic ? 'Public' : 'Private'}
      </div>

      {/* Password icon */}
      {room.hasPassword && (
        <div className="shrink-0" title="Password protected">
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-[var(--color-warning)]"
          >
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
          </svg>
        </div>
      )}

      {/* Join button */}
      <button
        type="button"
        onClick={() => onJoin(room)}
        className="shrink-0 variant-button-primary px-3 py-1.5 text-xs font-semibold font-sans cursor-pointer"
      >
        Join
      </button>
    </div>
  );
};
