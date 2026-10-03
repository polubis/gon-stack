import { useId } from 'react';
import { Plus } from 'lucide-react';
import { cn } from '@repo/react-kit/cn';
import { Button } from '@/shared/ui/controls';

/**
 * Stays focusable when `blocked` (`aria-disabled`, not `disabled`), so the
 * tooltip saying why shows on hover and on keyboard focus alike.
 */
export const AddLimitButton = ({
  blocked,
  onClick,
}: {
  blocked: boolean;
  onClick: () => void;
}) => {
  const hintId = useId();

  return (
    <div className="group relative">
      <Button
        variant="ghost"
        className={cn(
          'w-auto px-3 py-1.5',
          blocked && 'cursor-not-allowed opacity-60',
        )}
        aria-disabled={blocked || undefined}
        aria-describedby={blocked ? hintId : undefined}
        data-e2e="dashboard:limit-new"
        onClick={blocked ? undefined : onClick}
      >
        <Plus className="h-4 w-4" aria-hidden="true" /> Dodaj limit
      </Button>
      {blocked ? (
        <span
          id={hintId}
          role="tooltip"
          data-e2e="dashboard:limit-new-hint"
          className="pointer-events-none absolute bottom-full right-0 z-(--z-tooltip) mb-2 hidden w-56 rounded-lg bg-card px-3 py-2 text-xs shadow-popover group-focus-within:block group-hover:block"
        >
          Wszystkie kategorie mają już ustawiony limit.
        </span>
      ) : null}
    </div>
  );
};
