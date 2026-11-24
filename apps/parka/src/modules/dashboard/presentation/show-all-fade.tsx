import { Button } from '@/shared/ui/controls';

/** "Pokaż wszystkie" pinned over a fade at the bottom of a capped list box. */
export const ShowAllFade = ({
  onClick,
  'data-e2e': dataE2e,
}: {
  onClick: () => void;
  'data-e2e': 'dashboard:categories-toggle' | 'dashboard:expenses-toggle';
}) => (
  <div className="absolute inset-x-0 bottom-0 flex h-16 items-end justify-center bg-linear-to-t from-card from-40% to-transparent">
    <Button
      variant="ghost"
      className="w-auto px-3 py-1.5"
      onClick={onClick}
      data-e2e={dataE2e}
    >
      Pokaż wszystkie
    </Button>
  </div>
);
