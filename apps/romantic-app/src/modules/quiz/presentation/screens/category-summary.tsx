import { useContext } from '../context';

export const CategorySummary = () => {
  const ctx = useContext();
  const summary = ctx.useLastSummary();

  if (!summary) {
    return (
      <div className="space-y-3">
        <h2 className="text-xl font-semibold">Category complete</h2>
        <p className="text-sm opacity-80">No results yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Category complete</h2>
      <p className="text-sm opacity-80">Rounds played: {summary.roundsPlayed}</p>
      <p className="text-sm opacity-80">Matches: {summary.matches}</p>
      <p className="text-sm opacity-80">Compatibility: {summary.compatibility}%</p>
      <button
        type="button"
        className="rounded-lg border border-white/20 px-3 py-2 hover:bg-white/10"
        onClick={ctx.init}
      >
        Pick another category
      </button>
    </div>
  );
};
