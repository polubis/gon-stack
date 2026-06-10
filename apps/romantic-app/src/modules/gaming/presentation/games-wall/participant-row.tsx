import type { Participant } from '../../domain/models';
import type { RoomId } from '../../domain/models';

type ParticipantRowProps = {
  participant: Participant;
  activeRoomId: RoomId;
  isRoomCreator: boolean;
  onRemove: (roomId: RoomId, userId: string) => void;
};

export const ParticipantRow = ({
  participant,
  activeRoomId,
  isRoomCreator,
  onRemove,
}: ParticipantRowProps) => {
  const initial = participant.displayName.charAt(0).toUpperCase();

  return (
    <div className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-[color-mix(in_srgb,var(--color-primary-500)_8%,transparent)] transition-all duration-150 group">
      {/* Avatar */}
      <div className="shrink-0 w-8 h-8 rounded-full flex items-center justify-center bg-[color-mix(in_srgb,var(--color-primary-500)_28%,transparent)] border border-[color-mix(in_srgb,var(--color-primary-300)_45%,transparent)] text-[var(--color-primary-200)] text-xs font-bold font-sans select-none">
        {initial}
      </div>

      {/* Name */}
      <span className="flex-1 min-w-0 text-sm text-[var(--color-text-primary)] font-medium truncate">
        {participant.displayName}
      </span>

      {/* Remove button (creator only) */}
      {isRoomCreator && (
        <button
          type="button"
          title={`Remove ${participant.displayName}`}
          onClick={() => onRemove(activeRoomId, participant.userId)}
          className="shrink-0 opacity-0 group-hover:opacity-100 w-7 h-7 rounded-lg flex items-center justify-center border border-[color-mix(in_srgb,var(--color-error)_50%,transparent)] bg-[color-mix(in_srgb,var(--color-error)_12%,transparent)] text-[var(--color-error)] hover:bg-[color-mix(in_srgb,var(--color-error)_22%,transparent)] transition-all duration-150 cursor-pointer"
        >
          <svg
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      )}
    </div>
  );
};
