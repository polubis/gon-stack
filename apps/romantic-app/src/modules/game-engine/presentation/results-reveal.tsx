import { Alert } from '@/libs/ui/alert';
import { Button } from '@/libs/ui/button';
import { Card } from '@/libs/ui/card';
import { Heading } from '@/libs/ui/heading';
import { useContext } from './context';

const formatAnswer = (v: string | number | null) =>
  v === null ? 'No answer' : String(v);

export const ResultsReveal = () => {
  const ctx = useContext();
  const round = ctx.$latestResult.use();
  const question = ctx.$currentQuestion.use();
  const player1 = ctx.$player1.use();
  const player2 = ctx.$player2.use();

  if (!round || !question) return null;

  const variant =
    round.result === 'match'
      ? 'success'
      : round.result === 'mismatch'
        ? 'primary'
        : 'secondary';

  const headline =
    round.result === 'match'
      ? 'Match!'
      : round.result === 'mismatch'
        ? 'Different take'
        : 'No answer';

  return (
    <div className="flex flex-col gap-5">
      <header className="flex flex-col gap-2">
        <div className="variant-pill">ROUND RESULT</div>
        <Heading level={5}>{question.text}</Heading>
      </header>

      <Alert variant={variant}>
        <div className="flex flex-col gap-1">
          <strong>{headline}</strong>
          {round.pointsDelta > 0 ? (
            <span className="b2">
              +{round.pointsDelta} point for both of you
            </span>
          ) : null}
        </div>
      </Alert>

      <div className="grid gap-3 md:grid-cols-2">
        <Card className="flex flex-col gap-2">
          <span className="l1 text-muted">{player1.name}</span>
          <p className="b1">{formatAnswer(round.player1Answer.value)}</p>
        </Card>
        <Card className="flex flex-col gap-2">
          <span className="l1 text-muted">{player2.name}</span>
          <p className="b1">{formatAnswer(round.player2Answer.value)}</p>
        </Card>
      </div>

      {round.educationalTip ? (
        <Alert variant="secondary">
          <div className="flex flex-col gap-1">
            <strong>Insight</strong>
            <span className="b2">{round.educationalTip}</span>
          </div>
        </Alert>
      ) : null}

      <div className="flex justify-end">
        <Button onClick={() => ctx.trigger('[TRIGGER]_NEXT_QUESTION')}>
          Next question
        </Button>
      </div>
    </div>
  );
};
