import { useState } from 'react';
import { Pencil, Plus } from 'lucide-react';
import { CategoryAvatar } from '@/shared/ui/category-chip';
import { Button, Toggle } from '@/shared/ui/controls';
import { Card } from '@/shared/ui/layout';
import { Sheet } from '@/shared/ui/sheet';
import { useSheet } from '@/shared/ui/use-sheet';
import { dateLabel, money } from '../domain/format';
import type { Month, RecurringId } from '../domain/models';
import { useContext } from './context';
import { RecurringDetail } from './recurring-detail';
import { RecurringForm } from './recurring-form';
import { categoryOf } from './selectors';

type SheetKind = 'new' | `edit:${string}`;

/**
 * Recurring expenses: add, edit, delete, pause. Fixed height; the forms open
 * as a sheet over the card, so nothing around it moves.
 */
export const RecurringCard = ({ month }: { month: Month }) => {
  const ctx = useContext();
  const recurring = ctx.useRecurring();
  const categories = ctx.useCategories();
  const [openId, setOpenId] = useState<RecurringId | null>(null);
  const { sheet, open, close } = useSheet<SheetKind>();
  const editing = sheet?.startsWith('edit:')
    ? recurring.find((r) => `edit:${r.id}` === sheet)
    : undefined;

  return (
    <Card
      as="section"
      aria-labelledby="recurring-title"
      className="relative flex h-112 flex-col md:h-128 xl:col-span-4"
      data-e2e="dashboard:recurring"
    >
      <div
        inert={sheet ? true : undefined}
        className="flex min-h-0 flex-1 flex-col gap-4"
      >
        <div className="flex items-center justify-between gap-3">
          <h2 id="recurring-title" className="text-base font-semibold">
            Wydatki cykliczne
          </h2>
          <Button
            variant="ghost"
            className="w-auto px-3 py-1.5"
            data-e2e="dashboard:recurring-new"
            onClick={() => open('new')}
          >
            <Plus className="h-4 w-4" aria-hidden="true" /> Dodaj
          </Button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto pr-2">
          <ul className="space-y-2" data-e2e="dashboard:recurring-list">
            {recurring.map((r) => {
              const expanded = openId === r.id;
              return (
                <li
                  key={r.id}
                  className="space-y-3 rounded-xl border border-line p-3"
                >
                  <div className="flex items-center gap-3">
                    <CategoryAvatar
                      category={categoryOf(categories, r.categoryId)}
                    />
                    <button
                      type="button"
                      className="min-w-0 flex-1 text-left"
                      aria-expanded={expanded}
                      data-e2e={`dashboard:recurring-row:${r.id}`}
                      onClick={() => setOpenId(expanded ? null : r.id)}
                    >
                      <span className="block truncate text-sm font-medium">
                        {r.name}
                      </span>
                      <span className="block text-xs text-ink-soft">
                        Co miesiąc · {money(r.cost)} · następny{' '}
                        {dateLabel(r.nextPaymentDate)}
                      </span>
                    </button>
                    <button
                      type="button"
                      aria-label={`Edytuj: ${r.name}`}
                      data-e2e={`dashboard:recurring-edit:${r.id}`}
                      onClick={() => open(`edit:${r.id}`)}
                      className="grid h-8 w-8 shrink-0 place-items-center rounded-full text-ink-soft hover:bg-hover-soft"
                    >
                      <Pencil className="h-4 w-4" aria-hidden="true" />
                    </button>
                    <Toggle
                      checked={r.active}
                      onChange={(active) =>
                        ctx.updateRecurring({ ...r, active }, month)
                      }
                      label={`Śledzenie: ${r.name}`}
                    />
                  </div>

                  {expanded ? <RecurringDetail recurring={r} /> : null}
                </li>
              );
            })}
            {recurring.length === 0 ? (
              <li className="text-sm text-ink-soft">
                Brak wydatków cyklicznych.
              </li>
            ) : null}
          </ul>
        </div>
      </div>

      {sheet === 'new' ? (
        <Sheet title="Nowy wydatek cykliczny" onClose={close}>
          <RecurringForm month={month} onDone={close} />
        </Sheet>
      ) : null}
      {editing ? (
        <Sheet title="Edytuj wydatek cykliczny" onClose={close}>
          <RecurringForm recurring={editing} month={month} onDone={close} />
        </Sheet>
      ) : null}
    </Card>
  );
};
