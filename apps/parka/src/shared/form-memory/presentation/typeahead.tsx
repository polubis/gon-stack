import {
  useId,
  useState,
  type ComponentProps,
  type FocusEvent,
  type KeyboardEvent,
} from 'react';
import { Star } from 'lucide-react';
import { cn } from '@repo/react-kit/cn';
import { ClearableInput } from '@/shared/ui/clearable';
import {
  isFrequent,
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
};

const same = (a: string, b: string): boolean =>
  a.trim().toLowerCase() === b.trim().toLowerCase();

/**
 * Text input with a combobox list of remembered values: filtered as you type,
 * most used first. A small star inside the field marks a frequently used value.
 */
export const Typeahead = ({
  value,
  onValueChange,
  field,
  suggestions,
  onKeyDown,
  onFocus,
  disabled,
  readOnly,
  ...props
}: Props) => {
  const listId = useId();
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);

  const ranked = rankSuggestions(suggestions, field, value);
  const settled = ranked.length === 1 && same(ranked[0].value, value);
  const expanded =
    open && !disabled && !readOnly && ranked.length > 0 && !settled;
  const activeOption = expanded ? ranked[active] : undefined;
  const frequent = isFrequent(suggestions, field, value);

  const change = (next: string) => {
    onValueChange(next);
    setActive(-1);
    setOpen(true);
  };

  const choose = (next: string) => {
    onValueChange(next);
    setActive(-1);
    setOpen(false);
  };

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
    <div className="relative" onBlur={focusOut}>
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
        onFocus={(e) => {
          onFocus?.(e);
          setOpen(true);
        }}
        onKeyDown={keyDown}
        trailing={
          frequent && !disabled && !readOnly ? (
            <span className="pointer-events-none grid h-6 w-4 place-items-center text-ink-soft">
              <Star className="h-3 w-3" aria-hidden="true" />
              <span className="sr-only">Często używane</span>
            </span>
          ) : null
        }
      />
      {expanded ? (
        <div className="absolute inset-x-0 top-full z-(--z-tooltip) mt-1 overflow-hidden rounded-xl border border-line-strong bg-card text-ink shadow-popover">
          <ul
            id={listId}
            role="listbox"
            aria-label={props['aria-label'] ?? 'Podpowiedzi'}
            className="max-h-60 overflow-y-auto p-1"
          >
            {ranked.map((item, index) => (
              <li
                key={item.value}
                id={`${listId}-${index}`}
                role="option"
                aria-selected={index === active}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => choose(item.value)}
                className={cn(
                  'flex cursor-pointer items-center gap-2 rounded-lg py-2 pr-3 pl-3 text-sm',
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
        </div>
      ) : null}
    </div>
  );
};
