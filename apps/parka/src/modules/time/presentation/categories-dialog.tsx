import { Plus, Tags } from 'lucide-react';
import { openModal } from '@/shared/router/modal-stack';
import { Button } from '@/shared/ui/controls';
import { CategoryAvatar } from '@/shared/ui/category-chip';
import { EmptyState } from '@/shared/ui/empty-state';
import { useContext } from './context';
import { NEW_CATEGORY_MODAL } from './modal-ids';
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
              <li
                key={c.id}
                className="flex items-center gap-3 border-b border-line px-3 py-3 last:border-0"
              >
                <CategoryAvatar category={c} />
                <span className="min-w-0 flex-1 truncate text-sm font-medium">
                  {c.name}
                </span>
              </li>
            ))}
          </ul>
        </>
      )}
    </ModalShell>
  );
};
