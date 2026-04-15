import { useContext } from '../context';

export const Reveal = () => {
  const ctx = useContext();
  const question = ctx.useActiveQuestion();
  const localAnswer = ctx.useLocalAnswer();
  const partnerAnswer = ctx.usePartnerAnswer();
  const players = ctx.usePlayers();
  const isFinished = ctx.useStatus() === 'finished';

  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-xl font-semibold">Round reveal</h2>
      <p className="text-sm opacity-80">{question?.prompt}</p>
      <div className="grid gap-2">
        <p>
          Your answer: <span className="font-medium">{String(localAnswer ?? 'No answer')}</span>
        </p>
        <p>
          Partner answer:{' '}
          <span className="font-medium">{String(partnerAnswer ?? 'No answer')}</span>
        </p>
      </div>
      {question?.tip ? (
        <p className="text-sm rounded-lg border border-white/20 p-3">{question.tip}</p>
      ) : null}
      <p className="text-sm opacity-80">
        Scores: {players.map((player) => `${player.name}: ${player.score}`).join(' | ')}
      </p>
      <div className="flex gap-2">
        {!isFinished ? (
          <button
            type="button"
            className="rounded-lg border border-white/20 px-3 py-2 hover:bg-white/10"
            onClick={ctx.nextQuestion}
          >
            Next question
          </button>
        ) : null}
        <button
          type="button"
          className="rounded-lg border border-white/20 px-3 py-2 hover:bg-white/10"
          onClick={ctx.endSession}
        >
          End
        </button>
      </div>
    </div>
  );
};
