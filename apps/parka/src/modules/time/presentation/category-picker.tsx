import { List, Plus } from 'lucide-react';
import { cn } from '@repo/react-kit/cn';
import { openModal } from '@/shared/router/modal-stack';
import { CategoryIcon } from '@/shared/ui/icon';
import type { CategoryId } from '../domain/models';
import { useContext } from './context';
import { CATEGORIES_MODAL, NEW_CATEGORY_MODAL } from './modal-ids';
import { PICKER_LINK } from './picker-link';

/** Radio chips of the categories, with links to browse and add one. */
export const CategoryPicker = ({
  value,
  onChange,
}: {
  value: CategoryId | undefined;
  onChange: (id: CategoryId) => void;
}) => {
  const { categories } = useContext();
  return (
    <fieldset className="min-w-0">
      <div className="mb-1 flex items-center justify-between gap-2">
        <legend className="text-sm font-medium text-ink-soft">Kategoria</legend>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => openModal(CATEGORIES_MODAL)}
            className={PICKER_LINK}
          >
            <List className="h-3 w-3" aria-hidden="true" />
            Wszystkie
          </button>
          <button
            type="button"
            onClick={() => openModal(NEW_CATEGORY_MODAL)}
            className={PICKER_LINK}
          >
            <Plus className="h-3 w-3" aria-hidden="true" />
            Nowa kategoria
          </button>
        </div>
      </div>
      <div className="flex flex-wrap gap-2">
        {categories.map((item) => (
          <label
            key={item.id}
            className={cn(
              'flex h-9 cursor-pointer items-center gap-2 rounded-full border px-3 text-sm transition-colors has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-brand',
              item.id === value
                ? 'border-brand bg-brand-soft font-semibold text-brand'
                : 'border-line-strong hover:bg-hover-soft',
            )}
          >
            <input
              type="radio"
              name="task-category"
              value={item.id}
              checked={item.id === value}
              onChange={() => onChange(item.id)}
              className="sr-only"
            />
            <span style={{ color: item.color }}>
              <CategoryIcon id={item.icon} className="h-4 w-4" />
            </span>
            {item.name}
          </label>
        ))}
      </div>
    </fieldset>
  );
};
