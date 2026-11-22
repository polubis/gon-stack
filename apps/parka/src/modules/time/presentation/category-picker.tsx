import { openModal } from '@/shared/router/modal-stack';
import { Field, Select } from '@/shared/ui/controls';
import { ManageLink } from '@/shared/ui/manage-link';
import { CategoryIcon } from '@/shared/ui/icon';
import type { CategoryId } from '../domain/models';
import { useContext } from './context';
import { CATEGORIES_MODAL } from './modal-ids';

/** Select of the categories, each with its icon, with the link to manage them. */
export const CategoryPicker = ({
  value,
  onChange,
}: {
  value: CategoryId | undefined;
  onChange: (id: CategoryId) => void;
}) => {
  const { categories } = useContext();
  return (
    <Field
      label="Kategoria"
      required
      action={
        <ManageLink
          aria-label="Zarządzaj kategoriami"
          data-e2e="time:category-manage"
          onClick={() => openModal(CATEGORIES_MODAL)}
        />
      }
    >
      <Select
        data-e2e="time:category-select"
        value={value ?? ''}
        options={categories.map((item) => ({
          value: item.id,
          label: (
            <span className="flex items-center gap-2">
              <span style={{ color: item.color }}>
                <CategoryIcon id={item.icon} className="h-4 w-4" />
              </span>
              {item.name}
            </span>
          ),
        }))}
        // Radix reports '' while its list catches up with a new item: ignored.
        onValueChange={(id) => {
          const picked = categories.find((item) => item.id === id);
          if (picked) onChange(picked.id);
        }}
      />
    </Field>
  );
};
