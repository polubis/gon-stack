import { useContext } from '../context';

export const GameOver = () => {
  const ctx = useContext();
  const players = ctx.usePlayers();
  const winnerId = ctx.useWinnerId();

  const winner = players.find((player) => player.playerId === winnerId);

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-semibold">Game complete</h2>
      <p className="text-sm opacity-80">
        {winner ? `${winner.name} reached the target score first.` : 'Session finished.'}
      </p>
      <p className="text-sm opacity-80">
        Final scores: {players.map((player) => `${player.name}: ${player.score}`).join(' | ')}
      </p>
      <button
        type="button"
        className="rounded-lg border border-white/20 px-3 py-2 hover:bg-white/10"
        onClick={ctx.init}
      >
        Play again
      </button>
    </div>
  );
};
