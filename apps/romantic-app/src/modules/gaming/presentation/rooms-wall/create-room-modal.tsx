import React from 'react';
import type { CreateRoomPayload } from '../../core/ports/repository';

type CreateRoomModalProps = {
  isLoading: boolean;
  error: string | null;
  onSubmit: (payload: CreateRoomPayload) => void;
  onClose: () => void;
};

export const CreateRoomModal = ({
  isLoading,
  error,
  onSubmit,
  onClose,
}: CreateRoomModalProps) => {
  const [name, setName] = React.useState('');
  const [visibility, setVisibility] = React.useState<'public' | 'private'>('public');
  const [password, setPassword] = React.useState('');
  const [maxPlayers, setMaxPlayers] = React.useState(4);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    onSubmit({
      name: name.trim(),
      visibility,
      password: visibility === 'private' && password ? password : undefined,
    });
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
      <div className="relative variant-card w-full max-w-lg p-6 flex flex-col gap-5">
        {/* Header */}
        <div className="flex items-start gap-4">
          {/* Icon */}
          <div className="shrink-0 w-12 h-12 rounded-2xl flex items-center justify-center bg-[color-mix(in_srgb,var(--color-primary-500)_20%,transparent)] border border-[color-mix(in_srgb,var(--color-primary-300)_40%,transparent)]">
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-[var(--color-primary-300)]"
            >
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="16" />
              <line x1="8" y1="12" x2="16" y2="12" />
            </svg>
          </div>
          <div className="flex-1">
            <h2 className="t5 text-[var(--color-text-primary)]">Create a new room</h2>
            <p className="b3 text-[var(--color-text-tertiary)] mt-0.5">
              Set up your room and invite your partner to join
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

        {/* Error */}
        {error && (
          <div className="rounded-xl px-4 py-3 bg-[color-mix(in_srgb,var(--color-error)_12%,transparent)] border border-[color-mix(in_srgb,var(--color-error)_55%,transparent)]">
            <p className="b3 text-[var(--color-error)]">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* Room title */}
          <div className="flex flex-col gap-1.5">
            <label className="l1 text-[var(--color-text-tertiary)]">Room title</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter a cool name for your room"
              className="variant-input w-full px-3.5 py-2.5 rounded-[10px] text-sm font-sans"
              disabled={isLoading}
              required
            />
          </div>

          {/* Visibility */}
          <div className="flex flex-col gap-2">
            <label className="l1 text-[var(--color-text-tertiary)]">Visibility</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setVisibility('public')}
                className={`variant-option flex flex-col gap-1 px-4 py-3 text-left cursor-pointer ${
                  visibility === 'public' ? 'variant-option-active' : ''
                }`}
                disabled={isLoading}
              >
                <div className="flex items-center gap-2">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="2" y1="12" x2="22" y2="12" />
                    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                  </svg>
                  <span className="b2 font-semibold">Public</span>
                </div>
                <span className="c1 text-[var(--color-text-tertiary)]">
                  Any player with link can join
                </span>
              </button>
              <button
                type="button"
                onClick={() => setVisibility('private')}
                className={`variant-option flex flex-col gap-1 px-4 py-3 text-left cursor-pointer ${
                  visibility === 'private' ? 'variant-option-active' : ''
                }`}
                disabled={isLoading}
              >
                <div className="flex items-center gap-2">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  </svg>
                  <span className="b2 font-semibold">Private</span>
                </div>
                <span className="c1 text-[var(--color-text-tertiary)]">
                  Only invited players only
                </span>
              </button>
            </div>
          </div>

          {/* Password (private only) */}
          {visibility === 'private' && (
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <label className="l1 text-[var(--color-text-tertiary)]">
                  Protect room with password
                </label>
                <span className="c1 text-[var(--color-text-tertiary)] italic">(optional)</span>
              </div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter room password"
                className="variant-input w-full px-3.5 py-2.5 rounded-[10px] text-sm font-sans"
                disabled={isLoading}
              />
            </div>
          )}

          {/* Max players */}
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <label className="l1 text-[var(--color-text-tertiary)]">Max players</label>
              <span className="b3 font-semibold text-[var(--color-secondary-300)]">
                {maxPlayers}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setMaxPlayers((p) => Math.max(2, p - 1))}
                disabled={maxPlayers <= 2 || isLoading}
                className="variant-icon-button cursor-pointer disabled:opacity-40"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="5" y1="12" x2="19" y2="12" />
                </svg>
              </button>
              <div className="flex-1 h-2 rounded-full bg-[color-mix(in_srgb,var(--color-surface-200)_60%,transparent)] border border-[color-mix(in_srgb,var(--color-secondary-300)_25%,transparent)] overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-[var(--color-primary-500)] to-[var(--color-secondary-500)]"
                  style={{ width: `${((maxPlayers - 2) / 18) * 100}%` }}
                />
              </div>
              <button
                type="button"
                onClick={() => setMaxPlayers((p) => Math.min(20, p + 1))}
                disabled={maxPlayers >= 20 || isLoading}
                className="variant-icon-button cursor-pointer disabled:opacity-40"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="12" y1="5" x2="12" y2="19" />
                  <line x1="5" y1="12" x2="19" y2="12" />
                </svg>
              </button>
            </div>
            <p className="c1 text-[var(--color-text-tertiary)]">
              Choose max participants, from 2 to 20 players
            </p>
          </div>

          {/* Actions */}
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
              className="variant-button-primary px-5 py-2 text-sm font-semibold font-sans cursor-pointer disabled:opacity-60"
              disabled={isLoading || !name.trim()}
            >
              {isLoading ? 'Creating...' : 'Create room'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
