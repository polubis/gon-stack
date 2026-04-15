import type { AnswerValue } from '../../domain/models';
import { useContext } from '../context';

const AnswerComposer = ({
  onSubmit,
}: {
  onSubmit: (value: AnswerValue) => void;
}) => {
  const ctx = useContext();
  const question = ctx.useActiveQuestion();
  const isRoundLocked = ctx.useIsRoundLocked();

  if (!question) {
    return null;
  }

  if (question.answerType === 'multiple-choice') {
    return (
      <div className="grid gap-2">
        {question.options.map((option) => (
          <button
            key={option.value}
            type="button"
            className="rounded-lg border border-white/20 p-3 text-left hover:bg-white/10 disabled:opacity-50"
            disabled={isRoundLocked}
            onClick={() => onSubmit(option.value)}
          >
            {option.label}
          </button>
        ))}
      </div>
    );
  }

  if (question.answerType === 'yes-no') {
    return (
      <div className="flex gap-3">
        <button
          type="button"
          className="rounded-lg border border-white/20 px-4 py-2 hover:bg-white/10 disabled:opacity-50"
          disabled={isRoundLocked}
          onClick={() => onSubmit(true)}
        >
          Yes
        </button>
        <button
          type="button"
          className="rounded-lg border border-white/20 px-4 py-2 hover:bg-white/10 disabled:opacity-50"
          disabled={isRoundLocked}
          onClick={() => onSubmit(false)}
        >
          No
        </button>
      </div>
    );
  }

  if (question.answerType === 'scale') {
    return (
      <div className="flex gap-2 flex-wrap">
        {Array.from({ length: 5 }, (_, index) => index + 1).map((value) => (
          <button
            key={value}
            type="button"
            className="rounded-lg border border-white/20 px-4 py-2 hover:bg-white/10 disabled:opacity-50"
            disabled={isRoundLocked}
            onClick={() => onSubmit(value)}
          >
            {value}
          </button>
        ))}
      </div>
    );
  }

  return (
    <form
      className="flex gap-2"
      onSubmit={(event) => {
        event.preventDefault();
        const formData = new FormData(event.currentTarget);
        const answer = String(formData.get('answer') ?? '').trim();
        if (!answer) {
          return;
        }

        onSubmit(answer);
      }}
    >
      <input
        name="answer"
        type="text"
        maxLength={question.maxLength}
        disabled={isRoundLocked}
        className="flex-1 rounded-lg border border-white/20 bg-transparent px-3 py-2"
        placeholder="Type your answer"
      />
      <button
        type="submit"
        disabled={isRoundLocked}
        className="rounded-lg border border-white/20 px-4 py-2 hover:bg-white/10 disabled:opacity-50"
      >
        Send
      </button>
    </form>
  );
};

export const QuestionRound = () => {
  const ctx = useContext();
  const question = ctx.useActiveQuestion();
  const secondsLeft = ctx.useSecondsLeft();
  const localAnswer = ctx.useLocalAnswer();
  const players = ctx.usePlayers();

  if (!question) {
    return <p>Loading question...</p>;
  }

  return (
    <div className="flex flex-col gap-5">
      <header className="space-y-1">
        <h2 className="text-xl font-semibold">{question.prompt}</h2>
        <p className="text-sm opacity-80">
          Difficulty: {question.difficulty} | Timer: {secondsLeft}s
        </p>
        <p className="text-sm opacity-80">
          Scores: {players.map((player) => `${player.name}: ${player.score}`).join(' | ')}
        </p>
      </header>

      <AnswerComposer onSubmit={ctx.submitAnswer} />

      <div className="flex gap-2">
        <button
          type="button"
          className="rounded-lg border border-white/20 px-3 py-2 text-sm hover:bg-white/10"
          onClick={ctx.pause}
        >
          Pause
        </button>
        <button
          type="button"
          className="rounded-lg border border-white/20 px-3 py-2 text-sm hover:bg-white/10"
          onClick={ctx.endSession}
        >
          End session
        </button>
      </div>

      {localAnswer !== null ? (
        <p className="text-sm text-emerald-400">
          Answer locked. Waiting for your partner response...
        </p>
      ) : null}
    </div>
  );
};
