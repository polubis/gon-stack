import { Button } from '@/libs/ui/button';
import { useContext } from './context';

export const ScoreBar = () => {
  const ctx = useContext();
  const player1 = ctx.$player1.use();
  const player2 = ctx.$player2.use();
  const threshold = ctx.$winThreshold.use();
  const phase = ctx.$phase.use();
  const isPaused = ctx.$isPaused.use();

  const canPause =
    !isPaused &&
    phase !== 'category_selection' &&
    phase !== 'win_celebration' &&
    phase !== 'session_paused';

  return (
    <header className="flex items-center justify-between gap-4">
      <div className="flex items-center gap-4">
        <div className="flex flex-col">
          <span className="l1 text-muted">{player1.name}</span>
          <span className="t5">{player1.score}</span>
        </div>
        <span className="b2 text-muted">vs</span>
        <div className="flex flex-col">
          <span className="l1 text-muted">{player2.name}</span>
          <span className="t5">{player2.score}</span>
        </div>
        <div className="variant-pill">First to {threshold}</div>
      </div>

      {canPause ? (
        <Button
          variant="secondary"
          onClick={() => ctx.trigger('[TRIGGER]_PAUSE_SESSION')}
        >
          Pause
        </Button>
      ) : null}
    </header>
  );
};
