import {
  useId,
  useRef,
  useState,
  type ComponentProps,
  type FocusEvent,
  type KeyboardEvent,
} from 'react';
import { Settings2, Star } from 'lucide-react';
import { cn } from '@repo/react-kit/cn';
import { ClearableInput } from '@/shared/ui/clearable';
import { useField } from '@/shared/ui/controls';
import { PickerScreen } from '@/shared/ui/picker-screen';
import { useIsMobile } from '@/shared/ui/use-mobile';
import { usePopoverOpen } from '@/shared/ui/use-popover-open';
import {
  rankSuggestions,
  type Suggestion,
  type SuggestionField,
} from '../domain/suggestions';

type Props = Omit<
  ComponentProps<typeof ClearableInput>,
  'value' | 'onChange' | 'role' | 'trailing' | 'leading'
> & {
  value: string;
  onValueChange: (value: string) => void;
  field: SuggestionField;
  /** Everything remembered for the account; ranked and filtered as the user types. */
  suggestions: Suggestion[];
  /** Adds a "Zarządzaj" button at the bottom of the list that opens the manage popup. */
  onManage?: () => void;
};

const same = (a: string, b: string): boolean =>
  a.trim().toLowerCase() === b.trim().toLowerCase();

/**
 * Text input with a combobox list of remembered values: filtered as you type,
 * most used first. A star button inside the field opens the list on demand.
 * On mobile the input stays a plain field and the star opens a full-screen
 * picker with its own filter input (focused) above the list.
 */
export const Typeahead = ({
  value,
  onValueChange,
  field,
  suggestions,
  onManage,
  onKeyDown,
  onFocus,
  disabled,
  readOnly,
  ...props
}: Props) => {
  const listId = useId();
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const [browse, setBrowse] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);
  const starRef = useRef<HTMLButtonElement>(null);
  const fieldCtx = useField();
  const mobile = useIsMobile();
  const picker = usePopoverOpen(`typeahead:${field}`);
  const [filter, setFilter] = useState('');

  const ranked = rankSuggestions(suggestions, field, browse ? '' : value);
  const settled =
    !browse && ranked.length === 1 && same(ranked[0].value, value);
  const expanded =
    !mobile && open && !disabled && !readOnly && ranked.length > 0 && !settled;
  const activeOption = expanded ? ranked[active] : undefined;
  const hasAny = rankSuggestions(suggestions, field, '').length > 0;
  const label =
    props['aria-label'] ?? fieldCtx?.label ?? props.placeholder ?? 'pole';

  const toggle = () => {
    if (mobile) {
      setFilter('');
      picker.setOpen(true);
      return;
    }
    wrapRef.current?.querySelector('input')?.focus();
    setActive(-1);
    setBrowse(true);
    setOpen(!expanded);
  };

  const change = (next: string) => {
    onValueChange(next);
    setActive(-1);
    setBrowse(false);
    setOpen(true);
  };

  const choose = (next: string) => {
    onValueChange(next);
    setActive(-1);
    setBrowse(false);
    setOpen(false);
  };

  const pick = (next: string) => {
    onValueChange(next);
    picker.setOpen(false);
  };

  const shown = rankSuggestions(suggestions, field, filter);

  const keyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    onKeyDown?.(event);
    if (event.defaultPrevented) return;
    const last = ranked.length - 1;
    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        setOpen(true);
        setActive(active >= last ? 0 : active + 1);
        break;
      case 'ArrowUp':
        event.preventDefault();
        setOpen(true);
        setActive(active <= 0 ? last : active - 1);
        break;
      case 'Enter':
        if (activeOption) {
          event.preventDefault();
          choose(activeOption.value);
        }
        break;
      case 'Escape':
        if (expanded) {
          event.preventDefault();
          event.stopPropagation();
          setOpen(false);
          setActive(-1);
        }
        break;
    }
  };

  const focusOut = (event: FocusEvent<HTMLDivElement>) => {
    if (!event.currentTarget.contains(event.relatedTarget)) {
      setOpen(false);
      setActive(-1);
    }
  };

  return (
    <div ref={wrapRef} className="relative" onBlur={focusOut}>
      <ClearableInput
        {...props}
        value={value}
        disabled={disabled}
        readOnly={readOnly}
        role="combobox"
        autoComplete="off"
        aria-autocomplete="list"
        aria-expanded={expanded}
        aria-controls={expanded ? listId : undefined}
        aria-activedescendant={activeOption ? `${listId}-${active}` : undefined}
        onChange={(e) => change(e.target.value)}
        onFocus={onFocus}
        onKeyDown={keyDown}
        trailing={
          hasAny && !disabled && !readOnly ? (
            <button
              ref={starRef}
              type="button"
              aria-label={`Podpowiedzi: ${label}`}
              data-e2e={`form-memory:toggle:${field}`}
              aria-haspopup={mobile ? 'dialog' : 'listbox'}
              aria-expanded={mobile ? picker.open : expanded}
              aria-controls={expanded ? listId : undefined}
              onClick={toggle}
              className="grid h-5 w-5 place-items-center rounded-full text-ink-soft hover:bg-brand-soft hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
            >
              <Star className="h-3 w-3" aria-hidden="true" />
            </button>
          ) : null
        }
      />
      {expanded ? (
        <div className="absolute inset-x-0 top-full z-(--z-popover) mt-1 overflow-hidden rounded-lg border border-line-strong bg-card text-ink shadow-popover">
          <ul
            id={listId}
            role="listbox"
            aria-label={props['aria-label'] ?? 'Podpowiedzi'}
            className="max-h-48 overflow-y-auto p-0.5"
          >
            {ranked.map((item, index) => (
              <li
                key={item.value}
                id={`${listId}-${index}`}
                role="option"
                data-e2e={`form-memory:option:${item.value}`}
                aria-selected={index === active}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => choose(item.value)}
                className={cn(
                  'flex cursor-pointer items-center gap-2 min-w-0 rounded-md px-2 py-1 text-xs',
                  index === active && 'bg-brand-softer',
                )}
              >
                <span className="min-w-0 flex-1 truncate">{item.value}</span>
                {item.useCount > 0 ? (
                  <span className="shrink-0 text-xs text-ink-soft tabular-nums">
                    {item.useCount}×
                  </span>
                ) : null}
              </li>
            ))}
          </ul>
          {onManage ? (
            <div className="border-t border-line p-0.5">
              <button
                type="button"
                data-e2e={`form-memory:manage:${field}`}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => {
                  setOpen(false);
                  setActive(-1);
                  onManage();
                }}
                className="flex w-full items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium text-brand-dark transition-colors hover:bg-hover-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
              >
                <Settings2 className="h-3 w-3" aria-hidden="true" />
                Zarządzaj
              </button>
            </div>
          ) : null}
        </div>
      ) : null}
      {mobile ? (
        <PickerScreen
          open={picker.open}
          onClose={() => picker.setOpen(false)}
          title={label}
          returnFocus={starRef}
          data-e2e="form-memory:picker"
          header={
            <ClearableInput
              data-picker-focus=""
              type="search"
              aria-label={`Szukaj: ${label}`}
              placeholder="Szukaj"
              autoComplete="off"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            />
          }
        >
          {shown.length > 0 ? (
            <ul
              role="listbox"
              aria-label={`Podpowiedzi: ${label}`}
              className="flex flex-col gap-1"
            >
              {shown.map((item) => (
                <li
                  key={item.value}
                  role="option"
                  aria-selected={same(item.value, value)}
                  data-e2e={`form-memory:option:${item.value}`}
                  tabIndex={0}
                  onClick={() => pick(item.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      pick(item.value);
                    }
                  }}
                  className="flex min-w-0 cursor-pointer items-center gap-2 rounded-xl px-3 py-3 text-sm hover:bg-brand-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand aria-selected:font-semibold"
                >
                  <span className="min-w-0 flex-1 truncate">{item.value}</span>
                  {item.useCount > 0 ? (
                    <span className="shrink-0 text-xs text-ink-soft tabular-nums">
                      {item.useCount}×
                    </span>
                  ) : null}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-ink-soft">
              {filter.trim()
                ? `Brak wyników dla "${filter.trim()}"`
                : 'Brak podpowiedzi'}
            </p>
          )}
          {onManage ? (
            <button
              type="button"
              data-e2e={`form-memory:manage:${field}`}
              onClick={onManage}
              className="mt-3 flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-medium text-brand-dark hover:bg-hover-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
            >
              <Settings2 className="h-4 w-4" aria-hidden="true" />
              Zarządzaj
            </button>
          ) : null}
        </PickerScreen>
      ) : null}
    </div>
  );
};
