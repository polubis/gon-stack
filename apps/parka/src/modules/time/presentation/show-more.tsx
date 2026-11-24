import type { E2eId } from '@/__e2e__/selectors';
import { Button } from '@/shared/ui/controls';

/** How many comments / attachments a task popup shows before "Pokaż więcej". */
export const PREVIEW_COUNT = 2;

/** Reveals the whole list in place; stays hidden when nothing is folded. */
export const ShowMore = ({
  hidden,
  onClick,
  ...rest
}: {
  hidden: number;
  onClick: () => void;
  'data-e2e': E2eId;
}) =>
  hidden > 0 ? (
    <Button
      variant="ghost"
      className="w-auto self-start px-3 py-1.5 text-xs"
      onClick={onClick}
      {...rest}
    >
      Pokaż więcej ({hidden})
    </Button>
  ) : null;
