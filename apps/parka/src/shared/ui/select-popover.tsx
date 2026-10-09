import { useId, useState, type ReactNode } from 'react';
import * as Popover from '@radix-ui/react-popover';
import { ChevronDown } from 'lucide-react';
import { cn } from '@repo/react-kit/cn';
import type { E2eId } from '@/__e2e__/selectors';
import { inputClass } from './controls';

type Props = {
  label: string;
  /** What the closed field shows for the current choice. */
  value: ReactNode;
  /** Panel content; call `close` after a choice is made. */
  children: (close: () => void) => ReactNode;
  'data-e2e'?: E2eId;
};

/** Select-like field that opens one fixed popover on every screen size. */
export const SelectPopover = ({
  label,
  value,
  children,
  'data-e2e': e2e,
}: Props) => {
  const [open, setOpen] = useState(false);
  const labelId = useId();
  const triggerId = useId();

  return (
    <div>
      <span
        id={labelId}
        className="mb-1 block text-sm font-medium text-ink-soft"
      >
        {label}
      </span>
      <Popover.Root open={open} onOpenChange={setOpen}>
        <Popover.Trigger
          id={triggerId}
          aria-labelledby={`${labelId} ${triggerId}`}
          data-e2e={e2e}
          className={cn(
            inputClass,
            'flex items-center justify-between gap-2 text-left',
          )}
        >
          <span className="flex min-w-0 items-center gap-2">{value}</span>
          <ChevronDown
            className="h-4 w-4 shrink-0 text-ink-soft"
            aria-hidden="true"
          />
        </Popover.Trigger>
        <Popover.Portal>
          <Popover.Content
            align="start"
            sideOffset={4}
            collisionPadding={16}
            className="z-(--z-modal) w-(--radix-popover-trigger-width) rounded-xl border border-line-strong bg-card p-3 focus:outline-none"
          >
            {children(() => setOpen(false))}
          </Popover.Content>
        </Popover.Portal>
      </Popover.Root>
    </div>
  );
};
