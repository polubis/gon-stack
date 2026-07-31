import type { ConsentCategoryId } from '../domain/models';
import { copy } from './copy';
import { Toggle } from './toggle';

/* =============================================================================
 * Public Props
 * ============================================================================= */

export type CategoryRowProps = {
  id: ConsentCategoryId;
  checked: boolean;
  onToggle: () => void;
};

/* =============================================================================
 * Component
 * ============================================================================= */

export const CategoryRow = ({ id, checked, onToggle }: CategoryRowProps) => {
  const category = copy.preferences.categories[id];

  return (
    <div className="flex items-start justify-between gap-4 border-b border-line py-4 last:border-b-0">
      <div className="min-w-0">
        <p className="font-semibold text-secondary">{category.title}</p>
        <p className="mt-1 text-sm leading-relaxed text-ink-light">
          {category.description}
        </p>
      </div>
      <Toggle
        checked={checked}
        disabled={id === 'necessary'}
        label={category.title}
        onCheckedChange={onToggle}
      />
    </div>
  );
};
