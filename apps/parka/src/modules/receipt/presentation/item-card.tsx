import { ChevronDown } from 'lucide-react';
import { cn } from '@repo/react-kit/cn';
import { categoryLabel } from '@/shared/i18n/category-label';
import { CategoryAvatar } from '@/shared/ui/category-chip';
import { Card } from '@/shared/ui/layout';
import { Field, inputClass } from '@/shared/ui/controls';
import { NumberInput } from '@/shared/ui/number-input';
import { money } from '../domain/format';
import type { Category, ReceiptItem } from '../domain/models';
import { itemTotal, resolveCategory } from './selectors';

type Props = {
  item: ReceiptItem;
  categories: Category[];
  open: boolean;
  onToggle: () => void;
  onPatch: (patch: Partial<Omit<ReceiptItem, 'id'>>) => void;
};

export const ItemCard = ({
  item,
  categories,
  open,
  onToggle,
  onPatch,
}: Props) => {
  const category = resolveCategory(categories, item.categoryId);

  return (
    <Card as="li" className="space-y-3">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        className="flex w-full items-center gap-3 text-left"
      >
        <CategoryAvatar category={category} />
        <span className="flex-1">
          <span className="block text-sm font-medium">{item.name}</span>
          <span className="block text-xs text-ink-soft">
            {categoryLabel(category.name)}
          </span>
        </span>
        <span className="text-sm font-semibold tabular-nums">
          {money(itemTotal(item))}
        </span>
        <ChevronDown
          className={cn(
            'h-4 w-4 text-ink-soft transition-transform motion-reduce:transition-none',
            open && 'rotate-180',
          )}
          aria-hidden="true"
        />
      </button>

      {open ? (
        <div className="grid grid-cols-2 gap-3 border-t border-line pt-3">
          <div className="col-span-2">
            <Field label="Nazwa">
              <input
                className={inputClass}
                value={item.name}
                data-e2e={`receipt:item-name:${item.id}`}
                onChange={(e) => onPatch({ name: e.target.value })}
              />
            </Field>
          </div>
          <Field label="Cena">
            <NumberInput
              value={item.unitPrice}
              data-e2e={`receipt:item-price:${item.id}`}
              onValueChange={(unitPrice) => onPatch({ unitPrice })}
            />
          </Field>
          <Field label="Ilość">
            <NumberInput
              integer
              value={item.quantity}
              data-e2e={`receipt:item-qty:${item.id}`}
              onValueChange={(quantity) => onPatch({ quantity })}
            />
          </Field>
          <Field label="Rabat">
            <NumberInput
              value={item.discount}
              data-e2e={`receipt:item-discount:${item.id}`}
              onValueChange={(discount) => onPatch({ discount })}
            />
          </Field>
          <Field label="Kategoria">
            <select
              className={inputClass}
              value={item.categoryId}
              data-e2e={`receipt:item-category:${item.id}`}
              onChange={(e) => {
                const next = categories.find((c) => c.id === e.target.value);
                if (next) onPatch({ categoryId: next.id });
              }}
            >
              {categories.length === 0 ? (
                <option value={item.categoryId}>Bez kategorii</option>
              ) : null}
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {categoryLabel(c.name)}
                </option>
              ))}
            </select>
          </Field>
        </div>
      ) : null}
    </Card>
  );
};
