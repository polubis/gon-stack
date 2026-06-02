import { useRef, useState, useEffect } from 'react';
import { Text } from '@/libs/ui/text';
import { IconSearch, IconCaret, IconClose } from './icons';
import {
  CATEGORIES,
  CITIES,
  categoryLabel,
  datePresetLabel,
} from './mock-data';

export type SearchState = {
  name: string;
  category: string;
  city: string;
  date: string;
};

type SearchBarVariant = 'hero' | 'compact';

type SearchBarProps = {
  value: SearchState;
  onChange: (v: SearchState) => void;
  onSubmit: () => void;
  variant?: SearchBarVariant;
};

type DropdownProps = {
  children: React.ReactNode;
};

const Dropdown = ({ children }: DropdownProps) => (
  <div
    className="absolute top-[calc(100%+8px)] left-0 min-w-60 bg-card-bg border border-card-border-c rounded-[14px] shadow-[0_30px_60px_-20px_rgba(0,0,0,0.2)] z-30 max-h-80 overflow-y-auto p-1.5"
    onClick={(e) => e.stopPropagation()}
  >
    {children}
  </div>
);

type DropdownItemProps = {
  children: React.ReactNode;
  active: boolean;
  onClick: () => void;
};

const DropdownItem = ({ children, active, onClick }: DropdownItemProps) => (
  <button
    className={`flex items-center justify-between gap-3 w-full border-0 px-3 py-2.5 rounded-[10px] text-sm text-left transition-colors ${active ? 'bg-ink text-canvas' : 'bg-transparent text-ink hover:bg-surface'}`}
    onClick={onClick}
  >
    {children}
  </button>
);

export const SearchBar = ({
  value,
  onChange,
  onSubmit,
  variant = 'hero',
}: SearchBarProps) => {
  const [openField, setOpenField] = useState<string | null>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const nameInputRef = useRef<HTMLInputElement>(null);
  const compact = variant === 'compact';

  const handleSubmit = (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    onSubmit();
  };

  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node))
        setOpenField(null);
    };
    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, []);

  const setField = (k: keyof SearchState, v: string) =>
    onChange({ ...value, [k]: v });
  const fieldPad = compact ? 'px-4 py-2.5' : 'px-[18px] py-3.5';
  const inputSize = compact ? 'text-sm' : 'text-base';
  const submitMinH = compact ? 'min-h-11' : 'min-h-14';

  return (
    <div
      ref={wrapRef}
      className="bg-card-bg border border-card-border-c rounded-lg shadow-[0_30px_60px_-40px_rgba(0,0,0,0.18)]"
    >
      <form
        className="grid items-stretch grid-cols-[1.2fr_1px_1fr_1px_1fr_1px_1fr_auto]"
        onSubmit={handleSubmit}
      >
        {/* Name */}
        <div
          className={`relative flex flex-col gap-1 cursor-text min-w-0 ${fieldPad} ${openField === 'name' ? 'bg-surface rounded-l-lg' : ''}`}
          onClick={() => {
            setOpenField('name');
            nameInputRef.current?.focus();
          }}
        >
          <Text.MonoLabel className="text-[10px]!">Wydarzenie</Text.MonoLabel>
          <input
            ref={nameInputRef}
            className={`bg-transparent border-0 p-0 outline-none font-sans ${inputSize} text-ink placeholder:text-muted w-full`}
            type="text"
            required
            placeholder="Artysta, drużyna, tytuł…"
            value={value.name}
            onChange={(e) => setField('name', e.target.value)}
            onFocus={() => setOpenField('name')}
            onKeyDown={(e) => {
              if (e.key === 'Enter') onSubmit();
            }}
          />
        </div>

        <div className="bg-hairline my-3.5 w-px" />

        {/* Category */}
        <div
          className={`relative flex flex-col gap-1 cursor-pointer min-w-0 ${fieldPad} ${openField === 'category' ? 'bg-surface' : ''}`}
          onClick={() => setOpenField('category')}
        >
          <Text.MonoLabel className="text-[10px]!">Kategoria</Text.MonoLabel>
          <button
            className={`bg-transparent border-0 p-0 outline-none font-sans ${inputSize} text-ink flex items-center justify-between gap-2 w-full text-left`}
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setOpenField(openField === 'category' ? null : 'category');
            }}
          >
            <span>
              {value.category ? categoryLabel(value.category) : 'Wszystkie'}
            </span>
            <IconCaret />
          </button>
          {openField === 'category' && (
            <Dropdown>
              <DropdownItem
                active={!value.category}
                onClick={() => {
                  setField('category', '');
                  setOpenField(null);
                }}
              >
                Wszystkie kategorie
              </DropdownItem>
              {CATEGORIES.map((c) => (
                <DropdownItem
                  key={c.id}
                  active={value.category === c.id}
                  onClick={() => {
                    setField('category', c.id);
                    setOpenField(null);
                  }}
                >
                  <span>{c.label}</span>
                  <span
                    className={`font-mono text-[10px] tracking-[0.18em] ${value.category === c.id ? 'text-canvas opacity-60' : 'text-muted'}`}
                  >
                    {c.mono}
                  </span>
                </DropdownItem>
              ))}
            </Dropdown>
          )}
        </div>

        <div className="bg-hairline my-3.5 w-px" />

        {/* Location */}
        <div
          className={`relative flex flex-col gap-1 cursor-pointer min-w-0 ${fieldPad} ${openField === 'city' ? 'bg-surface' : ''}`}
          onClick={() => setOpenField('city')}
        >
          <Text.MonoLabel className="text-[10px]!">Lokalizacja</Text.MonoLabel>
          <button
            className={`bg-transparent border-0 p-0 outline-none font-sans ${inputSize} text-ink flex items-center justify-between gap-2 w-full text-left`}
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setOpenField(openField === 'city' ? null : 'city');
            }}
          >
            <span>{value.city || 'Cała Polska'}</span>
            <IconCaret />
          </button>
          {openField === 'city' && (
            <Dropdown>
              <DropdownItem
                active={!value.city}
                onClick={() => {
                  setField('city', '');
                  setOpenField(null);
                }}
              >
                Cała Polska
              </DropdownItem>
              {CITIES.map((c) => (
                <DropdownItem
                  key={c}
                  active={value.city === c}
                  onClick={() => {
                    setField('city', c);
                    setOpenField(null);
                  }}
                >
                  {c}
                </DropdownItem>
              ))}
            </Dropdown>
          )}
        </div>

        <div className="bg-hairline my-3.5 w-px" />

        {/* Date */}
        <div
          className={`relative flex flex-col gap-1 cursor-pointer min-w-0 ${fieldPad} ${openField === 'date' ? 'bg-surface' : ''}`}
          onClick={() => setOpenField('date')}
        >
          <Text.MonoLabel className="text-[10px]!">Data</Text.MonoLabel>
          <button
            className={`bg-transparent border-0 p-0 outline-none font-sans ${inputSize} text-ink flex items-center justify-between gap-2 w-full text-left`}
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setOpenField(openField === 'date' ? null : 'date');
            }}
          >
            <span>
              {value.date ? datePresetLabel(value.date) : 'Dowolna data'}
            </span>
            <IconCaret />
          </button>
          {openField === 'date' && (
            <Dropdown>
              {(
                ['', 'today', 'weekend', 'week', 'month', 'summer'] as const
              ).map((k) => (
                <DropdownItem
                  key={k || 'any'}
                  active={value.date === k}
                  onClick={() => {
                    setField('date', k);
                    setOpenField(null);
                  }}
                >
                  {k ? datePresetLabel(k) : 'Dowolna data'}
                </DropdownItem>
              ))}
            </Dropdown>
          )}
        </div>

        {/* Submit */}
        <button
          className={`m-2.5 bg-primary text-on-primary border-0 rounded-[18px] px-5.5 text-sm font-medium inline-flex items-center gap-2.5 ${submitMinH} whitespace-nowrap hover:opacity-90 transition-opacity`}
          type="submit"
          aria-label="Szukaj"
        >
          <IconSearch size={16} />
          <span>Szukaj</span>
        </button>
      </form>
    </div>
  );
};

type ActiveFilter = { k: keyof SearchState; label: string };

type ActiveFiltersProps = {
  search: SearchState;
  onClear: (k: keyof SearchState) => void;
  onClearAll: () => void;
};

export const ActiveFilters = ({
  search,
  onClear,
  onClearAll,
}: ActiveFiltersProps) => {
  const active: ActiveFilter[] = [];
  if (search.name) active.push({ k: 'name', label: `„${search.name}"` });
  if (search.category)
    active.push({ k: 'category', label: categoryLabel(search.category) });
  if (search.city) active.push({ k: 'city', label: search.city });
  if (search.date)
    active.push({ k: 'date', label: datePresetLabel(search.date) });

  if (active.length === 0) return null;

  return (
    <div className="flex gap-2 items-center flex-wrap mt-4">
      <Text.MonoLabel>FILTRY</Text.MonoLabel>
      {active.map((f) => (
        <button
          key={f.k}
          className="bg-ink text-canvas border-0 rounded-full px-3 py-1.5 text-sm inline-flex gap-2 items-center"
          onClick={() => onClear(f.k)}
        >
          {f.label} <IconClose size={12} />
        </button>
      ))}
      <button
        className="bg-transparent border-0 text-muted text-sm underline"
        onClick={onClearAll}
      >
        Wyczyść wszystko
      </button>
    </div>
  );
};
