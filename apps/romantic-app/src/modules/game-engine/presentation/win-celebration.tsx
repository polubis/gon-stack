import { Button } from '@/libs/ui/button';
import { Card } from '@/libs/ui/card';
import { Heading } from '@/libs/ui/heading';
import { useContext } from './context';

export const WinCelebration = () => {
  const ctx = useContext();
  const winnerId = ctx.$winnerId.use();
  const player1 = ctx.$player1.use();
  const player2 = ctx.$player2.use();
  const threshold = ctx.$winThreshold.use();

  const winner =
    winnerId === player1.id
      ? player1
      : winnerId === player2.id
        ? player2
        : null;

  return (
    <div className="flex flex-col gap-5">
      <header className="flex flex-col gap-2">
        <div className="variant-pill">GAME COMPLETE</div>
        <Heading level={3}>
          {winner
            ? `${winner.name} reached ${threshold} first!`
            : 'You did it!'}
        </Heading>
        <p className="b1">
          Whatever the score, every answer brought you closer together.
        </p>
      </header>

      <Card className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <span className="b1">{player1.name}</span>
          <span className="t5">{player1.score}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="b1">{player2.name}</span>
          <span className="t5">{player2.score}</span>
        </div>
      </Card>

      <div className="flex justify-end">
        <Button onClick={() => ctx.trigger('[TRIGGER]_INIT')}>
          Play again
        </Button>
      </div>
    </div>
  );
};
