import type { GameId } from '../../domain/models';

/* =============================================================================
 * Public Props
 * ============================================================================= */

export type LeaveGameConfirmDialogProps = {
  gameId: GameId | null;
  userId: string;
  onConfirm: (gameId: GameId, userId: string) => void;
  onCancel: () => void;
};

/* =============================================================================
 * Component
 * ============================================================================= */

export const LeaveGameConfirmDialog = ({
  gameId,
  userId,
  onConfirm,
  onCancel,
}: LeaveGameConfirmDialogProps) => {
  const handleConfirm = () => {
    if (gameId) {
      onConfirm(gameId, userId);
    }
  };

  return (
    /* Overlay */
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.7)' }}
      onClick={onCancel}
    >
      {/* Dialog panel */}
      <div
        className="relative w-full max-w-md mx-4 bg-[#12152a] border border-white/10 rounded-2xl shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top accent line */}
        <div className="h-0.5 w-full bg-gradient-to-r from-pink-600 via-fuchsia-500 to-purple-600" />

        <div className="px-8 py-8">
          {/* Warning icon */}
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
              <svg
                className="w-8 h-8 text-amber-400"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                <line x1="12" y1="9" x2="12" y2="13" />
                <line x1="12" y1="17" x2="12.01" y2="17" />
              </svg>
            </div>
          </div>

          {/* Title */}
          <h2 className="text-xl font-bold text-white text-center mb-2">
            Are you sure you want to leave?
          </h2>
          <p className="text-sm text-slate-400 text-center mb-6">
            This game is still in progress. If you leave now:
          </p>

          {/* Consequences list */}
          <div className="space-y-3 mb-8">
            <div className="flex items-start gap-3 bg-white/5 rounded-xl px-4 py-3">
              <span className="w-5 h-5 rounded-full bg-red-500/20 flex items-center justify-center shrink-0 mt-0.5">
                <svg className="w-3 h-3 text-red-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
                  <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" />
                </svg>
              </span>
              <p className="text-sm text-slate-300">
                <span className="font-semibold text-white">You won't get a final assignment.</span>
                <br />
                <span className="text-slate-400 text-xs">You need to complete the game to get a result.</span>
              </p>
            </div>

            <div className="flex items-start gap-3 bg-white/5 rounded-xl px-4 py-3">
              <span className="w-5 h-5 rounded-full bg-red-500/20 flex items-center justify-center shrink-0 mt-0.5">
                <svg className="w-3 h-3 text-red-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
                  <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" />
                </svg>
              </span>
              <p className="text-sm text-slate-300">
                <span className="font-semibold text-white">You will linger in the same task.</span>
                <br />
                <span className="text-slate-400 text-xs">Other players will continue without you in the background.</span>
              </p>
            </div>
          </div>

          {/* Notice checkbox row */}
          <label className="flex items-center gap-3 mb-8 cursor-pointer group">
            <span className="w-4 h-4 rounded border border-slate-500 bg-transparent group-hover:border-pink-500 transition-colors shrink-0" />
            <span className="text-xs text-slate-400">
              Don't show this warning again for this session.
            </span>
          </label>

          {/* Actions */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 py-2.5 px-4 rounded-xl border border-white/10 bg-white/5 text-sm font-semibold text-slate-300 hover:bg-white/10 hover:text-white transition-all duration-150"
            >
              Stay in game
            </button>
            <button
              type="button"
              onClick={handleConfirm}
              className="flex-1 py-2.5 px-4 rounded-xl bg-gradient-to-r from-pink-600 to-fuchsia-600 text-sm font-semibold text-white shadow-lg shadow-pink-600/30 hover:saturate-150 transition-all duration-150"
            >
              Leave game anyway
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
