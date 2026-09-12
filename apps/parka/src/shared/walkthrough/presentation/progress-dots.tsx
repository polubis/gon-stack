import { cn } from '@repo/react-kit/cn';
import { useContext } from './context';

export const ProgressDots = () => {
  const ctx = useContext();
  const total = ctx.useTotalSteps();
  const active = ctx.useActiveStepIndex();

  return (
    <ol
      className="mt-8 flex gap-2"
      aria-label={`Krok ${active + 1} z ${total}`}
    >
      {Array.from({ length: total }, (_, index) => (
        <li
          key={index}
          aria-current={index === active ? 'step' : undefined}
          className={cn(
            'h-1.5 rounded-full transition-all',
            index === active ? 'w-6 bg-brand' : 'w-1.5 bg-black/15',
          )}
        />
      ))}
    </ol>
  );
};
