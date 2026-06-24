import { Button } from '@/libs/ui/button';
import { Card } from '@/libs/ui/card';
import { Heading } from '@/libs/ui/heading';
import { useContext } from './context';

export const SessionPaused = () => {
  const ctx = useContext();

  return (
    <div className="flex flex-col gap-5">
      <header className="flex flex-col gap-2">
        <div className="variant-pill">PAUSED</div>
        <Heading level={4}>Take a breath</Heading>
        <p className="b1">
          The session is paused. Resume whenever you are ready.
        </p>
      </header>

      <Card className="flex flex-col gap-3">
        <p className="b2 text-muted">
          Note: resuming returns to the current phase. The timer does not
          continue the countdown yet — a follow-up will make pause fully
          time-aware.
        </p>
        <div className="flex justify-end">
          <Button onClick={() => ctx.trigger('[TRIGGER]_RESUME_SESSION')}>
            Resume
          </Button>
        </div>
      </Card>
    </div>
  );
};
