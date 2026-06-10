import React from 'react';
import type { Room } from '../../domain/models';

type JoinRoomModalProps = {
  rooms: Room[];
  isLoading: boolean;
  error: string | null;
  onSubmit: (payload: { roomId: string; roomCode: string; roomPassword?: string }) => void;
  onClose: () => void;
};

type Step = 'code' | 'password';

export const JoinRoomModal = ({
  rooms,
  isLoading,
  error,
  onSubmit,
  onClose,
}: JoinRoomModalProps) => {
  const [code, setCode] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [step, setStep] = React.useState<Step>('code');
  const [matchedRoom, setMatchedRoom] = React.useState<Room | null>(null);
  const [codeError, setCodeError] = React.useState('');

  const handleCodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = code.trim().toUpperCase();
    if (!trimmed) return;

    const found = rooms.find(
      (r) => r.code.toUpperCase() === trimmed,
    );

    if (!found) {
      setCodeError('No room found with this code. Check the code and try again.');
      return;
    }

    setCodeError('');
    setMatchedRoom(found);

    if (!found.hasPassword) {
      onSubmit({ roomId: found.id, roomCode: found.code });
    } else {
      setStep('password');
    }
  };

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!matchedRoom) return;
    onSubmit({
      roomId: matchedRoom.id,
      roomCode: matchedRoom.code,
      roomPassword: password,
    });
  };

  const handleBack = () => {
    setStep('code');
    setPassword('');
    setMatchedRoom(null);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

      {/* Modal */}
      <div className="relative variant-card w-full max-w-md p-6 flex flex-col gap-5">
        {/* Header */}
        <div className="flex items-start gap-4">
          {/* Icon */}
          <div className="shrink-0 w-12 h-12 rounded-2xl flex items-center justify-center bg-[color-mix(in_srgb,var(--color-secondary-500)_20%,transparent)] border border-[color-mix(in_srgb,var(--color-secondary-300)_40%,transparent)]">
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-[var(--color-secondary-300)]"
            >
              <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
              <polyline points="10 17 15 12 10 7" />
              <line x1="15" y1="12" x2="3" y2="12" />
            </svg>
          </div>
          <div className="flex-1">
            <h2 className="t5 text-[var(--color-text-primary)]">Join room via code</h2>
            <p className="b3 text-[var(--color-text-tertiary)] mt-0.5">
              {step === 'code'
                ? 'Enter the 6-character room code to find and join a room'
                : 'This room is password protected'}
            </p>
          </div>
          {/* Close */}
          <button
            type="button"
            onClick={onClose}
            className="variant-icon-button cursor-pointer text-[var(--color-text-tertiary)] hover:text-[var(--color-text-primary)]"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Error from store */}
        {error && (
          <div className="rounded-xl px-4 py-3 bg-[color-mix(in_srgb,var(--color-error)_12%,transparent)] border border-[color-mix(in_srgb,var(--color-error)_55%,transparent)]">
            <p className="b3 text-[var(--color-error)]">{error}</p>
          </div>
        )}

        {step === 'code' && (
          <form onSubmit={handleCodeSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="l1 text-[var(--color-text-tertiary)]">Room code</label>
              <input
                type="text"
                value={code}
                onChange={(e) => {
                  setCode(e.target.value);
                  setCodeError('');
                }}
                placeholder="e.g. ABC123"
                maxLength={10}
                className="variant-input w-full px-3.5 py-2.5 rounded-[10px] text-sm font-mono uppercase tracking-widest"
                disabled={isLoading}
                autoFocus
                required
              />
              {codeError && (
                <p className="c1 text-[var(--color-error)]">{codeError}</p>
              )}
            </div>

            <div className="flex items-center justify-end gap-3 pt-1">
              <button
                type="button"
                onClick={onClose}
                className="variant-button-ghost px-4 py-2 text-sm font-semibold font-sans cursor-pointer"
                disabled={isLoading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="variant-button-secondary px-5 py-2 text-sm font-semibold font-sans cursor-pointer disabled:opacity-60"
                disabled={isLoading || !code.trim()}
              >
                {isLoading ? 'Joining...' : 'Join room'}
              </button>
            </div>
          </form>
        )}

        {step === 'password' && matchedRoom && (
          <form onSubmit={handlePasswordSubmit} className="flex flex-col gap-4">
            {/* Matched room info */}
            <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-[color-mix(in_srgb,var(--color-secondary-500)_10%,transparent)] border border-[color-mix(in_srgb,var(--color-secondary-300)_25%,transparent)]">
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-[var(--color-secondary-300)]"
              >
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
              <div className="flex-1 min-w-0">
                <p className="b2 font-semibold text-[var(--color-text-primary)] truncate">
                  {matchedRoom.name}
                </p>
                <p className="c1 text-[var(--color-text-tertiary)]">
                  {matchedRoom.participantCount} participant{matchedRoom.participantCount !== 1 ? 's' : ''}
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="l1 text-[var(--color-text-tertiary)]">Room password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter room password"
                className="variant-input w-full px-3.5 py-2.5 rounded-[10px] text-sm font-sans"
                disabled={isLoading}
                autoFocus
                required
              />
            </div>

            <div className="flex items-center justify-between pt-1">
              <button
                type="button"
                onClick={handleBack}
                className="variant-button-ghost px-4 py-2 text-sm font-semibold font-sans cursor-pointer"
                disabled={isLoading}
              >
                Back
              </button>
              <button
                type="submit"
                className="variant-button-secondary px-5 py-2 text-sm font-semibold font-sans cursor-pointer disabled:opacity-60"
                disabled={isLoading || !password}
              >
                {isLoading ? 'Joining...' : 'Join room'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
