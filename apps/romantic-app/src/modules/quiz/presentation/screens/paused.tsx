import { useContext } from '../context';

export const Paused = () => {
  const ctx = useContext();

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-semibold">Session paused</h2>
      <p className="text-sm opacity-80">
        You can continue from the current question or stop this session.
      </p>
      <div className="flex gap-2">
        <button
          type="button"
          className="rounded-lg border border-white/20 px-3 py-2 hover:bg-white/10"
          onClick={ctx.resume}
        >
          Resume
        </button>
        <button
          type="button"
          className="rounded-lg border border-white/20 px-3 py-2 hover:bg-white/10"
          onClick={ctx.endSession}
        >
          End session
        </button>
      </div>
    </div>
  );
};
