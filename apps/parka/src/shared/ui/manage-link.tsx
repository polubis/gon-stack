import type { ComponentProps } from 'react';
import { Settings2 } from 'lucide-react';
import { cn } from '@repo/react-kit/cn';
import type { E2eId } from '@/__e2e__/selectors';

/**
 * The one "Zarządzaj" link next to a metadata picker (category, priority, tag,
 * catalog): opens the management list of that entity over the form. Give it
 * an `aria-label` naming the entity.
 */
export const ManageLink = ({
  className,
  ...rest
}: Omit<ComponentProps<'button'>, 'type' | 'children' | 'data-e2e'> & {
  'data-e2e'?: E2eId;
}) => (
  <button
    type="button"
    className={cn(
      'inline-flex min-h-6 items-center gap-1 rounded-md px-1 text-xs font-semibold text-brand hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand',
      className,
    )}
    {...rest}
  >
    <Settings2 className="h-3 w-3" aria-hidden="true" />
    Zarządzaj
  </button>
);
