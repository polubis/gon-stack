import { useState } from 'react';
import { Search } from 'lucide-react';
import { cn } from '@repo/react-kit/cn';
import { inputClass } from '@/shared/ui/controls';
import { CATEGORY_ICON_OPTIONS, CategoryIcon } from '@/shared/ui/icon';
import type { CategoryIconId } from '@/shared/ui/category-icon-ids';
import { SelectPopover } from '@/shared/ui/select-popover';
import { ICON_CATALOG, ICON_GROUPS } from '../configuration/icon-catalog';
import type { IconGroup } from '../configuration/icon-catalog';

type Props = {
  value: CategoryIconId;
  color: string;
  onChange: (icon: CategoryIconId) => void;
};

type GroupFilter = IconGroup | 'all';

const chipClass = (active: boolean) =>
  cn(
    'shrink-0 rounded-full border px-3 py-1.5 text-xs font-medium',
    active
      ? 'border-brand bg-brand-softer text-brand'
      : 'border-line-strong text-ink-soft hover:bg-hover-soft',
  );

const normalize = (text: string) =>
  text.toLowerCase().replace(/ł/g, 'l').normalize('NFD').replace(/[̀-ͯ]/g, '');

type PanelProps = Props & { close: () => void };

/** Own component so the search resets each time the popover opens. */
const Panel = ({ value, color, onChange, close }: PanelProps) => {
  const [query, setQuery] = useState('');
  const [group, setGroup] = useState<GroupFilter>('all');

  const needle = normalize(query.trim());
  const visible = CATEGORY_ICON_OPTIONS.filter(
    (id) =>
      (group === 'all' || ICON_CATALOG[id].group === group) &&
      (!needle || normalize(ICON_CATALOG[id].label).includes(needle)),
  );

  return (
    <div className="space-y-3">
      <div className="relative">
        <Search
          className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-soft"
          aria-hidden="true"
        />
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Szukaj, np. kawa"
          aria-label="Szukaj ikony"
          data-e2e="categories:form-icon-search"
          className={cn(inputClass, 'pl-9')}
        />
      </div>

      <div
        role="group"
        aria-label="Grupy ikon"
        data-e2e="categories:form-icon-groups"
        className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-2"
      >
        <button
          type="button"
          aria-pressed={group === 'all'}
          onClick={() => setGroup('all')}
          className={chipClass(group === 'all')}
        >
          Wszystkie
        </button>
        {ICON_GROUPS.map((g) => (
          <button
            key={g}
            type="button"
            aria-pressed={group === g}
            onClick={() => setGroup(g)}
            className={chipClass(group === g)}
          >
            {g}
          </button>
        ))}
      </div>

      {visible.length === 0 ? (
        <p className="py-4 text-center text-sm text-ink-soft">
          Brak ikon pasujących do „{query.trim()}”.
        </p>
      ) : (
        <div className="grid max-h-60 grid-cols-5 gap-2 overflow-y-auto pr-2">
          {visible.map((id) => {
            const selected = id === value;
            return (
              <button
                key={id}
                type="button"
                title={ICON_CATALOG[id].label}
                aria-label={ICON_CATALOG[id].label}
                aria-pressed={selected}
                data-e2e={`categories:form-icon:${id}`}
                onClick={() => {
                  onChange(id);
                  close();
                }}
                className={cn(
                  'grid h-11 w-full place-items-center rounded-xl border',
                  selected
                    ? 'border-current'
                    : 'border-line-strong text-ink-soft hover:bg-hover-soft',
                )}
                style={
                  selected
                    ? {
                        color,
                        backgroundColor: `color-mix(in srgb, ${color} 15%, transparent)`,
                      }
                    : undefined
                }
              >
                <CategoryIcon id={id} className="h-5 w-5" />
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

export const IconPicker = (props: Props) => (
  <SelectPopover
    label="Ikona"
    data-e2e="categories:form-icons"
    value={
      <>
        <span style={{ color: props.color }}>
          <CategoryIcon id={props.value} className="h-5 w-5" />
        </span>
        <span className="truncate">{ICON_CATALOG[props.value].label}</span>
      </>
    }
  >
    {(close) => <Panel {...props} close={close} />}
  </SelectPopover>
);
