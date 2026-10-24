import { ChevronRight, Plus, Tags } from 'lucide-react';
import { openModal } from '@/shared/router/modal-stack';
import { Button } from '@/shared/ui/controls';
import { CategoryAvatar } from '@/shared/ui/category-chip';
import { EmptyState } from '@/shared/ui/empty-state';
import { useContext } from './context';
import { editCategoryModal, NEW_CATEGORY_MODAL } from './modal-ids';
import { ModalShell } from './modal-shell';

/** Browse list of the categories, same rows as the finance categories list. */
export const CategoriesDialog = ({ modal }: { modal: string }) => {
  const { categories } = useContext();
  const add = (
    <Button
      onClick={() => openModal(NEW_CATEGORY_MODAL)}
      className="w-auto px-3 py-2"
    >
      <Plus className="h-4 w-4" aria-hidden="true" /> Dodaj
    </Button>
  );

  return (
    <ModalShell
      modal={modal}
      data-e2e="time:categories-dialog"
      title="Kategorie"
      description="Wszystkie kategorie zadań."
    >
      {categories.length === 0 ? (
        <EmptyState
          icon={Tags}
          title="Nie masz jeszcze kategorii"
          description="Dodaj pierwszą kategorię zadań."
          action={add}
        />
      ) : (
        <>
          <div className="mb-3 flex justify-end">{add}</div>
          <ul className="max-h-80 overflow-y-auto overflow-x-hidden rounded-2xl border border-line bg-card">
            {categories.map((c) => (
              <li key={c.id} className="border-b border-line last:border-0">
                <button
                  type="button"
                  aria-label={`Edytuj kategorię ${c.name}`}
                  onClick={() => openModal(editCategoryModal(c.id))}
                  className="flex w-full items-center gap-3 px-3 py-3 text-left transition-colors hover:bg-hover-soft focus-visible:bg-hover-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-brand"
                >
                  <CategoryAvatar category={c} />
                  <span className="min-w-0 flex-1 truncate text-sm font-medium">
                    {c.name}
                  </span>
                  <ChevronRight
                    className="h-5 w-5 text-ink-soft"
                    aria-hidden="true"
                  />
                </button>
              </li>
            ))}
          </ul>
        </>
      )}
    </ModalShell>
  );
};
