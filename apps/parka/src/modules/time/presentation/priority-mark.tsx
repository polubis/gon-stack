import { ArrowDown, ArrowUp } from 'lucide-react';
import { cn } from '@repo/react-kit/cn';
import { priorityLevel } from '../domain/priority';
import type { PriorityId } from '../domain/models';
import { useContext } from './context';

/** Small arrow for high (>= 8) and low (<= 3) priorities; medium shows nothing. */
export const PriorityMark = ({ id }: { id?: PriorityId }) => {
  const priority = useContext().priorities.find((item) => item.id === id);
  const level = priority ? priorityLevel(priority.value) : 'medium';
  if (!priority || level === 'medium') return null;
  const Icon = level === 'high' ? ArrowUp : ArrowDown;
  return (
    <span
      className={cn(
        'shrink-0',
        level === 'high' ? 'text-danger' : 'text-ink-soft',
      )}
    >
      <Icon className="h-4 w-4" aria-hidden="true" />
      <span className="sr-only">
        Priorytet {priority.value}: {priority.name}
      </span>
    </span>
  );
};
