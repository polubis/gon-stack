import { Field, Select } from '@/shared/ui/controls';
import { CategoryIcon } from '@/shared/ui/icon';
import type { CategoryId } from '../domain/models';
import { useContext } from './context';

/** Select of the categories, each with its icon. */
export const CategoryPicker = ({
  value,
  onChange,
}: {
  value: CategoryId | undefined;
  onChange: (id: CategoryId) => void;
}) => {
  const { categories } = useContext();
  return (
    <Field label="Kategoria">
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
