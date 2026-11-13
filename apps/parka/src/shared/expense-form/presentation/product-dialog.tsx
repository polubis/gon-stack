import * as Dialog from '@radix-ui/react-dialog';
import { Check, Trash2, X } from 'lucide-react';
import { ClearableInput } from '@/shared/ui/clearable';
import { categoryLabel } from '@/shared/i18n/category-label';
import { useModalMounted } from '@/shared/router/modal-stack';
import { Button, Field, Select } from '@/shared/ui/controls';
import { NumberInput } from '@/shared/ui/number-input';
import type { Category, Product } from '../domain/models';

type Props = {
  product: Product;
  categories: Category[];
  /** Its id in the URL modal stack. */
  modal: string;
  /** Marks an unnamed product invalid (after a save attempt). */
  invalid: boolean;
  onPatch: (patch: Partial<Omit<Product, 'id'>>) => void;
  onRemove: () => void;
  onClose: () => void;
};

/** Popup stacked over the expense form where one product is edited. */
export const ProductDialog = ({
  product,
  categories,
  modal,
  invalid,
  onPatch,
  onRemove,
  onClose,
}: Props) => {
  useModalMounted(modal);

  return (
    <Dialog.Root
      open
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-(--z-modal) bg-overlay" />
        <Dialog.Content
          data-e2e="expense-form:product-dialog"
          aria-describedby={undefined}
          className="fixed inset-x-4 bottom-[calc(var(--kb-inset,0rem)+1rem)] z-(--z-modal) mx-auto max-h-[calc(100dvh-var(--kb-inset,0rem)-2rem)] max-w-md animate-pop-in overflow-y-auto rounded-4xl border border-line bg-card p-5 shadow-popover focus:outline-none motion-reduce:animate-none lg:bottom-auto lg:top-1/2 lg:-translate-y-1/2"
        >
          <div className="mb-3 flex items-center gap-3">
            <Dialog.Title className="min-w-0 flex-1 truncate text-base font-semibold">
              {product.name || 'Nowy produkt'}
            </Dialog.Title>
            <Dialog.Close
              aria-label="Zamknij"
              className="grid h-8 w-8 shrink-0 place-items-center rounded-full text-ink-soft transition-colors hover:bg-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
            >
              <X className="h-4 w-4" aria-hidden="true" />
            </Dialog.Close>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <Field
                label="Nazwa produktu"
                hint={invalid ? 'Podaj nazwę produktu.' : undefined}
              >
                <ClearableInput
                  value={product.name}
                  required
                  aria-invalid={invalid}
                  autoFocus
                  data-e2e={`expense-form:product-name:${product.id}`}
                  onChange={(e) => onPatch({ name: e.target.value })}
                />
              </Field>
            </div>
            <Field label="Cena">
              <NumberInput
                value={product.unitPrice}
                data-e2e={`expense-form:product-price:${product.id}`}
                onValueChange={(unitPrice) => onPatch({ unitPrice })}
              />
            </Field>
            <Field label="Ilość">
              <NumberInput
                integer
                value={product.quantity}
                data-e2e={`expense-form:product-qty:${product.id}`}
                onValueChange={(quantity) => onPatch({ quantity })}
              />
            </Field>
            <Field label="Rabat">
              <NumberInput
                value={product.discount}
                data-e2e={`expense-form:product-discount:${product.id}`}
                onValueChange={(discount) => onPatch({ discount })}
              />
            </Field>
            <Field label="Kategoria produktu">
              <Select
                value={product.categoryId}
                data-e2e={`expense-form:product-category:${product.id}`}
                options={
                  categories.length === 0
                    ? [{ value: product.categoryId, label: 'Bez kategorii' }]
                    : categories.map((c) => ({
                        value: c.id,
                        label: categoryLabel(c.name),
                      }))
                }
                onValueChange={(id) => {
                  const next = categories.find((c) => c.id === id);
                  if (next) onPatch({ categoryId: next.id });
                }}
              />
            </Field>
          </div>
          <div className="mt-4 flex items-center gap-2">
            <Button
              variant="danger"
              className="w-auto"
              data-e2e={`expense-form:product-remove:${product.id}`}
              onClick={onRemove}
            >
              <Trash2 className="h-4 w-4" aria-hidden="true" /> Usuń produkt
            </Button>
            <Button
              className="ml-auto w-auto"
              data-e2e="expense-form:product-done"
              onClick={onClose}
            >
              <Check className="h-4 w-4" aria-hidden="true" /> Gotowe
            </Button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};
