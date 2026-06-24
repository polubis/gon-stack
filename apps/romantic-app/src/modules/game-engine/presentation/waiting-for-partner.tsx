import { Card } from '@/libs/ui/card';
import { Heading } from '@/libs/ui/heading';
import { ProgressIndicator } from '@/libs/ui/progress-indicator';
import { Spinner } from '@/libs/ui/spinner';
import { useContext } from './context';

export const WaitingForPartner = () => {
  const ctx = useContext();
  const question = ctx.$currentQuestion.use();
  const remaining = ctx.$timerRemaining.use();
  const percent = ctx.$timerPercent.use();
  const player1Answer = ctx.$player1Answer.use();
  const player2 = ctx.$player2.use();

  return (
    <div className="flex flex-col gap-5">
      <header className="flex flex-col gap-2">
        <div className="variant-pill">WAITING</div>
        <Heading level={5}>Answer locked in</Heading>
        <p className="b1">{question?.text}</p>
      </header>

      <Card className="flex flex-col gap-4">
        <div className="flex items-center gap-3">
          <Spinner variant="secondary" />
          <p className="b1">Waiting for {player2.name} to answer…</p>
        </div>
        <div className="flex items-center gap-3">
          <ProgressIndicator
            variant={remaining > 10 ? 'secondary' : 'primary'}
            value={percent}
            max={100}
            size="sm"
          />
          <span className="l1 text-muted">{remaining}s</span>
        </div>
        <p className="b2 text-muted">
          Your answer:{' '}
          {player1Answer?.value === null
            ? 'skipped'
            : String(player1Answer?.value)}
        </p>
      </Card>
    </div>
  );
};
