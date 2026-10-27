import { useEffect } from 'react';
import { Gauge, Plus } from 'lucide-react';
import { categoryLabel } from '@/shared/i18n/category-label';
import {
  closeModal,
  closeModalThen,
  openModal,
  useModalStack,
} from '@/shared/router/modal-stack';
import { Button } from '@/shared/ui/controls';
import { EmptyState } from '@/shared/ui/empty-state';
import { ConfirmDeleteDialog } from './confirm-delete-dialog';
import { useContext } from './context';
import { DetailDialog } from './detail-dialog';
import { LimitForm } from './limit-form';
import {
  LIMITS_MODAL,
  NEW_LIMIT_MODAL,
  limitModal,
  limitOfDeleteModal,
  limitOfModal,
} from './modal-ids';
import { categoryOf, isCategoryLimit } from './selectors';
import { money } from '../domain/format';

const LimitsList = ({ modal }: { modal: string }) => {
  const ctx = useContext();
  const limits = ctx.useLimits();
  const categories = ctx.useCategories();
  const add = (
    <Button
      onClick={() => openModal(NEW_LIMIT_MODAL)}
      data-e2e="dashboard:limits-dialog-add"
      className="w-auto px-3 py-2"
    >
      <Plus className="h-4 w-4" aria-hidden="true" /> Dodaj
    </Button>
  );
  const rows = [...limits].sort(
    (a, b) => Number(isCategoryLimit(a)) - Number(isCategoryLimit(b)),
  );

  return (
    <DetailDialog
      modal={modal}
      data-e2e="dashboard:limits-dialog"
      title="Limity"
      description="Limit miesięczny i limity kategorii."
      onClose={() => closeModal(modal)}
    >
      {rows.length === 0 ? (
        <EmptyState
          data-e2e="dashboard:limits-dialog-empty"
          icon={Gauge}
          title="Nie masz jeszcze limitów"
          description="Dodaj limit miesięczny lub limit kategorii."
          action={add}
        />
      ) : (
        <>
          <div className="mb-3 flex justify-end">{add}</div>
          <ul
            data-e2e="dashboard:limits-dialog-list"
            className="max-h-80 overflow-y-auto overflow-x-hidden rounded-2xl border border-line bg-card"
          >
            {rows.map((limit) => {
              const name = isCategoryLimit(limit)
                ? categoryLabel(categoryOf(categories, limit.categoryId).name)
                : 'Limit miesięczny';
              return (
                <li
                  key={limit.id}
                  className="flex items-center gap-3 border-b border-line px-3 py-3 last:border-0"
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{name}</p>
                    <p className="text-xs text-ink-soft">
                      {money(limit.amount)} · powiadomienie od {limit.alertAt}%
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    className="w-auto px-3 py-1.5"
                    aria-label={`Edytuj limit: ${name}`}
                    data-e2e={`dashboard:limit-edit:${limit.id}`}
                    onClick={() => openModal(limitModal(limit.id))}
                  >
                    Edytuj
                  </Button>
                </li>
              );
            })}
          </ul>
        </>
      )}
    </DetailDialog>
  );
};

/** Renders the limit popups that are open in the URL stack. */
export const LimitModals = () => {
  const ctx = useContext();
  const stack = useModalStack();
  const limits = ctx.useLimits();

  // A popup of a limit that is gone (stale link, removal) must not linger.
  const dangling = stack.find((modal) => {
    const id = limitOfModal(modal) ?? limitOfDeleteModal(modal);
    return id !== null && !limits.some((l) => l.id === id);
  });
  useEffect(() => {
    if (dangling) closeModal(dangling);
  }, [dangling]);

  return (
    <>
      {stack.map((modal) => {
        if (modal === LIMITS_MODAL)
          return <LimitsList key={modal} modal={modal} />;
        if (modal === NEW_LIMIT_MODAL)
          return <LimitForm key={modal} modal={modal} />;
        const editId = limitOfModal(modal);
        if (editId !== null) {
          const limit = limits.find((l) => l.id === editId);
          return limit ? (
            <LimitForm key={modal} modal={modal} limit={limit} />
          ) : null;
        }
        const deleteId = limitOfDeleteModal(modal);
        if (deleteId !== null && limits.some((l) => l.id === deleteId))
          return (
            <ConfirmDeleteDialog
              key={modal}
              modal={modal}
              title="Usunąć limit?"
              description="Limit zniknie, a powiadomienia o nim przestaną przychodzić."
              confirmLabel="Usuń"
              onClose={() => closeModal(modal)}
              onConfirm={() =>
                closeModalThen(modal, () => {
                  closeModal(limitModal(deleteId));
                  ctx.removeLimit(deleteId);
                })
              }
            />
          );
        return null;
      })}
    </>
  );
};
