import {
  createRef,
  useEffect,
  useEffectEvent,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  useSyncExternalStore,
  type ComponentProps,
  type KeyboardEvent,
  type ReactNode,
} from 'react';
import { Check, ChevronDown, Search as SearchIcon, X } from 'lucide-react';
import { context } from '@repo/react-kit/context';
import { selectStream } from './select-stream.js';
import { playTone } from './select-sound.js';

type SelectMode = 'auto' | 'popover' | 'modal';

type Presence = 'stay' | 'enter' | 'exit';

type Row<T> = { item: T; key: string; presence: Presence };

type SelectOptions<T> = {
  /** Stable id: stream events, URL sync, deep links. Defaults to `useId`. */
  id?: string;
  value?: T | null;
  defaultValue?: T | null;
  onValueChange?: (value: T | null) => void;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  query?: string;
  onQueryChange?: (query: string) => void;
  /** Identity of an item: equality, list keys, form value. Defaults to `String`. */
  itemKey?: (item: T) => string;
  /** `auto`: modal (full screen) below `modalQuery`, popover above. */
  mode?: SelectMode;
  modalQuery?: string;
  /** Soft tone on open and close. */
  sound?: boolean;
  /** Modal pushes one history entry, so native Back closes it. */
  closeOnBack?: boolean;
  disabled?: boolean;
  required?: boolean;
  /** Renders a hidden input with `itemKey(value)` for native forms. */
  name?: string;
};

type SelectRootProps<T> = SelectOptions<T> &
  Omit<ComponentProps<'div'>, 'id' | 'defaultValue' | 'onChange' | 'ref'>;

type SelectValueProps<T> = Omit<ComponentProps<'span'>, 'children'> & {
  placeholder?: ReactNode;
  children?: (value: T) => ReactNode;
};

type SelectContentProps = Omit<ComponentProps<'div'>, 'title'> & {
  /** Modal heading; falls back to the label for the accessible name. */
  title?: ReactNode;
  closeLabel?: string;
};

type SelectSearchProps = Omit<ComponentProps<'input'>, 'value' | 'type'> & {
  clearLabel?: string;
};

type SelectListProps<T> = Omit<ComponentProps<'div'>, 'children'> & {
  items: readonly T[];
  children: (item: T, index: number) => ReactNode;
};

type SelectItemProps<T> = Omit<ComponentProps<'div'>, 'onSelect'> & {
  value: T;
  disabled?: boolean;
};

type SelectEmptyProps = Omit<ComponentProps<'div'>, 'children'> & {
  children: ReactNode | ((query: string) => ReactNode);
};

const MODAL_QUERY = '(max-width: 39.99rem)';
const PAGE = 10;
const OPTION =
  '[role="option"]:not([aria-disabled="true"]):not([data-presence="exit"])';
const FOCUSABLE = 'button:not(:disabled), input:not(:disabled), [tabindex="0"]';

const useMedia = (query: string) =>
  useSyncExternalStore(
    (notify) => {
      const media = window.matchMedia(query);
      media.addEventListener('change', notify);
      return () => media.removeEventListener('change', notify);
    },
    () => window.matchMedia(query).matches,
    () => false,
  );

/** Calls `done` once the element's running animations end (now if none). */
const afterAnimations = (el: Element, done: () => void) => {
  const running = el.getAnimations();
  if (running.length === 0) return done();
  void Promise.allSettled(running.map((a) => a.finished)).then(done);
};

/** Keeps a closing element mounted until its exit animation ends. */
const usePresence = (open: boolean) => {
  const ref = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(open);
  if (open && !mounted) setMounted(true);

  useEffect(() => {
    if (open || !mounted) return;
    let alive = true;
    afterAnimations(ref.current!, () => alive && setMounted(false));
    return () => {
      alive = false;
    };
  }, [open, mounted]);

  return { ref, mounted, state: open ? 'open' : 'closed' } as const;
};

const pushedBy = (id: string) =>
  (window.history.state as { dsSelect?: string } | null)?.dsSelect === id;

/** New items enter, gone ones stay as `exit` at their old spot until animated out. */
const mergeRows = <T,>(
  rows: readonly Row<T>[],
  items: readonly T[],
  toKey: (item: T) => string,
): Row<T>[] => {
  const live = new Set(
    rows.filter((row) => row.presence !== 'exit').map((row) => row.key),
  );
  const next = items.map((item): Row<T> => {
    const key = toKey(item);
    return { item, key, presence: live.has(key) ? 'stay' : 'enter' };
  });
  const keys = new Set(next.map((row) => row.key));
  rows.forEach((row, index) => {
    if (!keys.has(row.key))
      next.splice(Math.min(index, next.length), 0, {
        ...row,
        presence: 'exit',
      });
  });
  return next;
};

const useSelectState = <T,>(options: SelectOptions<T>) => {
  const autoId = useId();
  const id = options.id ?? autoId;
  const toKey = options.itemKey ?? String;
  const closeOnBack = options.closeOnBack ?? true;
  const narrow = useMedia(options.modalQuery ?? MODAL_QUERY);
  const mode: Exclude<SelectMode, 'auto'> =
    options.mode === 'popover' || options.mode === 'modal'
      ? options.mode
      : narrow
        ? 'modal'
        : 'popover';

  const [ownValue, setOwnValue] = useState<T | null>(
    options.defaultValue ?? null,
  );
  const [ownOpen, setOwnOpen] = useState(options.defaultOpen ?? false);
  const [ownQuery, setOwnQuery] = useState('');
  const [activeId, setActiveId] = useState<string | null>(null);
  const [count, setCount] = useState(0);
  const [hasSearch, setHasSearch] = useState(false);
  const value = options.value === undefined ? ownValue : options.value;
  const open = options.open ?? ownOpen;
  const query = options.query ?? ownQuery;

  // Plain ref objects kept in state: parts read them only in events/effects.
  const [{ rootNode, triggerNode, listNode, searchNode }] = useState(() => ({
    rootNode: createRef<HTMLDivElement>(),
    triggerNode: createRef<HTMLButtonElement>(),
    listNode: createRef<HTMLDivElement>(),
    searchNode: createRef<HTMLInputElement>(),
  }));
  const returnFocus = useRef(true);

  const ids = {
    label: `${autoId}label`,
    trigger: `${autoId}trigger`,
    list: `${autoId}list`,
    title: `${autoId}title`,
  };

  const setQuery = (next: string) => {
    setOwnQuery(next);
    options.onQueryChange?.(next);
  };

  const setValue = (next: T | null) => {
    setOwnValue(next);
    options.onValueChange?.(next);
  };

  const commit = (next: boolean) => {
    setOwnOpen(next);
    options.onOpenChange?.(next);
    if (next) return;
    if (query !== '') setQuery('');
    if (returnFocus.current) triggerNode.current?.focus();
  };

  const show = () => {
    if (open || options.disabled) return;
    returnFocus.current = true;
    commit(true);
  };

  const close = (focus = true) => {
    if (!open) return;
    returnFocus.current = focus;
    if (mode === 'modal' && closeOnBack && pushedBy(id))
      return window.history.back();
    commit(false);
  };

  const choose = (item: T) => {
    setValue(item);
    close();
  };

  const clear = () => {
    setValue(null);
    triggerNode.current?.focus();
  };

  const optionEls = () => [
    ...(listNode.current?.querySelectorAll<HTMLElement>(OPTION) ?? []),
  ];

  /** Keeps the active option valid; `fresh` restarts it at the selected one. */
  const syncActive = (fresh: boolean) =>
    setActiveId((current) => {
      const els = optionEls();
      const kept = !fresh && els.find((el) => el.id === current);
      const selected = fresh && els.find((el) => el.ariaSelected === 'true');
      return (kept || selected || els[0])?.id ?? null;
    });

  const move = (by: number | 'first' | 'last') => {
    const els = optionEls();
    if (els.length === 0) return;
    const at = els.findIndex((el) => el.id === activeId);
    const next =
      by === 'first'
        ? 0
        : by === 'last'
          ? els.length - 1
          : Math.max(0, Math.min(els.length - 1, at + by));
    setActiveId(els[next]!.id);
  };

  const pick = () => document.getElementById(activeId ?? '')?.click();

  const onCommand = useEffectEvent((next: boolean) =>
    next ? show() : close(false),
  );
  const onToggle = useEffectEvent((next: boolean) => {
    if (options.sound) playTone(next ? 'open' : 'close');
  });
  const onBack = useEffectEvent(() => {
    if (!pushedBy(id)) commit(false);
  });
  const onOutside = useEffectEvent(() => close(false));

  useEffect(
    () => selectStream.connect(id, { setOpen: (next) => onCommand(next) }),
    [id],
  );

  // History entry first, so stream listeners (URL sync) write onto it.
  useEffect(() => {
    if (!open || mode !== 'modal' || !closeOnBack) return;
    if (!pushedBy(id))
      window.history.pushState(
        { ...(window.history.state as object), dsSelect: id },
        '',
      );
    const handle = () => onBack();
    window.addEventListener('popstate', handle);
    return () => window.removeEventListener('popstate', handle);
  }, [open, mode, closeOnBack, id]);

  useEffect(() => {
    if (!open) return;
    selectStream.emit('open', id);
    onToggle(true);
    return () => {
      selectStream.emit('close', id);
      onToggle(false);
    };
  }, [open, id]);

  useEffect(() => {
    if (!open || mode !== 'popover') return;
    const handle = (event: PointerEvent) => {
      if (!rootNode.current?.contains(event.target as Node)) onOutside();
    };
    document.addEventListener('pointerdown', handle);
    return () => document.removeEventListener('pointerdown', handle);
  }, [open, mode, rootNode]);

  useEffect(() => {
    if (!open || mode !== 'modal') return;
    const { style } = document.body;
    const before = style.overflow;
    style.overflow = 'hidden';
    return () => {
      style.overflow = before;
    };
  }, [open, mode]);

  return {
    id,
    ids,
    mode,
    value,
    open,
    query,
    activeId,
    count,
    hasSearch,
    disabled: options.disabled ?? false,
    required: options.required ?? false,
    name: options.name,
    toKey,
    rootNode,
    triggerNode,
    listNode,
    searchNode,
    setQuery,
    setActiveId,
    setCount,
    setHasSearch,
    show,
    close,
    choose,
    clear,
    syncActive,
    move,
    pick,
  };
};

const [ItemProvider, useItem] = context(
  'SelectItem',
  (item: { selected: boolean }) => item,
);

/**
 * Builds a typed headless select for item type `T` (compound parts). Each
 * call owns its context; `Select` below is the `string` instance.
 */
export const createSelect = <T,>() => {
  const [Provider, useSelect] = context('Select', (options: SelectOptions<T>) =>
    useSelectState(options),
  );

  const [RowProvider, useRow] = context(
    'SelectRow',
    (row: { presence: Presence; onExited: () => void }) => row,
  );

  const Root = ({
    id,
    value,
    defaultValue,
    onValueChange,
    open,
    defaultOpen,
    onOpenChange,
    query,
    onQueryChange,
    itemKey,
    mode,
    modalQuery,
    sound,
    closeOnBack,
    disabled,
    required,
    name,
    children,
    ...props
  }: SelectRootProps<T>) => (
    <Provider
      value={{
        id,
        value,
        defaultValue,
        onValueChange,
        open,
        defaultOpen,
        onOpenChange,
        query,
        onQueryChange,
        itemKey,
        mode,
        modalQuery,
        sound,
        closeOnBack,
        disabled,
        required,
        name,
      }}
    >
      <Frame {...props}>{children}</Frame>
    </Provider>
  );

  const Frame = ({ children, ...props }: ComponentProps<'div'>) => {
    const { rootNode, ...s } = useSelect();
    return (
      <div
        {...props}
        ref={rootNode}
        data-ds-select=""
        data-state={s.open ? 'open' : 'closed'}
        data-mode={s.mode}
        data-disabled={s.disabled || undefined}
      >
        {children}
        {s.name ? (
          <input
            type="hidden"
            name={s.name}
            value={s.value === null ? '' : s.toKey(s.value)}
          />
        ) : null}
      </div>
    );
  };

  const Label = (props: ComponentProps<'label'>) => {
    const s = useSelect();
    return (
      <label
        {...props}
        id={s.ids.label}
        htmlFor={s.ids.trigger}
        data-ds-select-label=""
      />
    );
  };

  /** Positioning wrapper for trigger + clear + icon (a button can't nest buttons). */
  const Control = (props: ComponentProps<'div'>) => {
    const s = useSelect();
    return (
      <div
        {...props}
        data-ds-select-control=""
        data-filled={s.value !== null && !s.disabled}
      />
    );
  };

  const Trigger = ({
    onClick,
    onKeyDown,
    ...props
  }: Omit<ComponentProps<'button'>, 'ref' | 'type'>) => {
    const { triggerNode, ...s } = useSelect();
    return (
      <button
        aria-labelledby={
          props['aria-label'] ? undefined : `${s.ids.label} ${s.ids.trigger}`
        }
        {...props}
        ref={triggerNode}
        type="button"
        role="combobox"
        id={s.ids.trigger}
        aria-haspopup="listbox"
        aria-expanded={s.open}
        aria-controls={s.open ? s.ids.list : undefined}
        aria-required={s.required || undefined}
        disabled={s.disabled}
        data-ds-select-trigger=""
        data-state={s.open ? 'open' : 'closed'}
        data-placeholder={s.value === null || undefined}
        onClick={(event) => {
          onClick?.(event);
          if (event.defaultPrevented) return;
          if (s.open) s.close();
          else s.show();
        }}
        onKeyDown={(event) => {
          onKeyDown?.(event);
          if (event.key !== 'ArrowDown' && event.key !== 'ArrowUp') return;
          event.preventDefault();
          s.show();
        }}
      />
    );
  };

  const Value = ({ placeholder, children, ...props }: SelectValueProps<T>) => {
    const s = useSelect();
    const filled = s.value !== null;
    return (
      <span
        {...props}
        data-ds-select-value=""
        data-placeholder={!filled || undefined}
      >
        {/* Keyed: a new value remounts, so the theme can animate it in. */}
        <span key={filled ? s.toKey(s.value as T) : ''} data-ds-select-text="">
          {filled ? (children ?? String)(s.value as T) : placeholder}
        </span>
      </span>
    );
  };

  const Clear = ({
    onClick,
    children,
    ...props
  }: Omit<ComponentProps<'button'>, 'type'>) => {
    const s = useSelect();
    if (s.value === null || s.disabled) return null;
    return (
      <button
        aria-label="Clear selection"
        {...props}
        type="button"
        data-ds-select-clear=""
        onClick={(event) => {
          onClick?.(event);
          if (!event.defaultPrevented) s.clear();
        }}
      >
        {children ?? <X aria-hidden="true" focusable="false" />}
      </button>
    );
  };

  const Icon = ({ children, ...props }: ComponentProps<'span'>) => {
    const s = useSelect();
    return (
      <span
        {...props}
        aria-hidden="true"
        data-ds-select-icon=""
        data-state={s.open ? 'open' : 'closed'}
      >
        {children ?? <ChevronDown focusable="false" />}
      </span>
    );
  };

  const Content = ({
    title,
    closeLabel = 'Close',
    children,
    onKeyDown,
    ...props
  }: SelectContentProps) => {
    const { searchNode, listNode, ...s } = useSelect();
    const { ref: contentNode, mounted, state } = usePresence(s.open);
    const typed = useRef({ text: '', at: 0 });
    const modal = s.mode === 'modal';

    const onOpen = useEffectEvent(() => {
      (searchNode.current ?? listNode.current)?.focus();
      s.syncActive(true);
    });

    useEffect(() => {
      if (s.open) onOpen();
    }, [s.open]);

    if (!mounted) return null;

    const typeahead = (event: KeyboardEvent<HTMLDivElement>) => {
      const last = typed.current;
      const now = event.timeStamp;
      const char = event.key.toLowerCase();
      const text = now - last.at < 500 ? last.text + char : char;
      typed.current = { text, at: now };
      const hit = [
        ...event.currentTarget.querySelectorAll<HTMLElement>(OPTION),
      ].find((el) => el.textContent!.trim().toLowerCase().startsWith(text));
      if (hit) s.setActiveId(hit.id);
    };

    const trap = (event: KeyboardEvent<HTMLDivElement>) => {
      const els = [
        ...event.currentTarget.querySelectorAll<HTMLElement>(FOCUSABLE),
      ];
      const at = els.indexOf(document.activeElement as HTMLElement);
      const next = event.shiftKey
        ? (at - 1 + els.length) % els.length
        : (at + 1) % els.length;
      event.preventDefault();
      els[next]?.focus();
    };

    const keys = (event: KeyboardEvent<HTMLDivElement>) => {
      onKeyDown?.(event);
      if (event.defaultPrevented) return;
      const inList = event.target === listNode.current;
      const moves: Record<string, number | 'first' | 'last'> = {
        ArrowDown: 1,
        ArrowUp: -1,
        PageDown: PAGE,
        PageUp: -PAGE,
        ...(inList ? { Home: 'first', End: 'last' } : {}),
      };
      const by = moves[event.key];
      if (by !== undefined) {
        event.preventDefault();
        return s.move(by);
      }
      if (event.key === 'Enter' || (inList && event.key === ' ')) {
        event.preventDefault();
        return s.pick();
      }
      if (event.key === 'Escape') {
        event.preventDefault();
        event.stopPropagation();
        return s.close();
      }
      if (event.key === 'Tab') return modal ? trap(event) : s.close(false);
      if (inList && event.key.length === 1 && !event.ctrlKey && !event.metaKey)
        typeahead(event);
    };

    return (
      <div
        {...props}
        ref={contentNode}
        role={modal ? 'dialog' : undefined}
        aria-modal={modal || undefined}
        aria-labelledby={
          modal ? (title ? s.ids.title : s.ids.label) : undefined
        }
        data-ds-select-content=""
        data-mode={s.mode}
        data-state={state}
        onKeyDown={keys}
      >
        {modal ? (
          <div data-ds-select-header="">
            {title ? (
              <h2 id={s.ids.title} data-ds-select-title="">
                {title}
              </h2>
            ) : null}
            <button
              type="button"
              aria-label={closeLabel}
              data-ds-select-close=""
              onClick={() => s.close()}
            >
              <X aria-hidden="true" focusable="false" />
            </button>
          </div>
        ) : null}
        {children}
      </div>
    );
  };

  const Search = ({
    clearLabel = 'Clear search',
    'aria-label': ariaLabel = 'Search',
    onChange,
    ...props
  }: SelectSearchProps) => {
    const { searchNode, ...s } = useSelect();
    const { setHasSearch } = s;

    useLayoutEffect(() => {
      setHasSearch(true);
      return () => setHasSearch(false);
    }, [setHasSearch]);

    return (
      <div data-ds-select-search="" data-filled={s.query !== ''}>
        <SearchIcon
          aria-hidden="true"
          focusable="false"
          data-ds-select-search-icon=""
        />
        <input
          autoComplete="off"
          spellCheck={false}
          {...props}
          ref={searchNode}
          aria-label={ariaLabel}
          type="search"
          role="combobox"
          aria-expanded="true"
          aria-controls={s.ids.list}
          aria-autocomplete="list"
          aria-activedescendant={s.activeId ?? undefined}
          value={s.query}
          onChange={(event) => {
            onChange?.(event);
            s.setQuery(event.target.value);
          }}
        />
        {s.query !== '' ? (
          <button
            type="button"
            aria-label={clearLabel}
            data-ds-select-search-clear=""
            onClick={() => {
              s.setQuery('');
              searchNode.current?.focus();
            }}
          >
            <X aria-hidden="true" focusable="false" />
          </button>
        ) : null}
      </div>
    );
  };

  const List = ({ items, children, ...props }: SelectListProps<T>) => {
    const { listNode, ...s } = useSelect();
    const { toKey, setCount, syncActive } = s;
    const [rows, setRows] = useState<Row<T>[]>(() =>
      mergeRows([], items, toKey).map((row) => ({
        ...row,
        presence: 'stay' as const,
      })),
    );
    const [seen, setSeen] = useState(items);
    if (seen !== items) {
      setSeen(items);
      setRows(mergeRows(rows, items, toKey));
    }
    const initial = useRef(true);

    const onItems = useEffectEvent(() => {
      setCount(items.length);
      if (!initial.current) syncActive(false);
      initial.current = false;
    });

    useLayoutEffect(() => {
      onItems();
    }, [items]);

    const exited = (key: string) =>
      setRows((current) =>
        current.filter((row) => row.key !== key || row.presence !== 'exit'),
      );

    return (
      <div
        aria-labelledby={s.ids.label}
        {...props}
        ref={listNode}
        role="listbox"
        id={s.ids.list}
        tabIndex={s.hasSearch ? -1 : 0}
        aria-activedescendant={
          s.hasSearch ? undefined : (s.activeId ?? undefined)
        }
        aria-required={s.required || undefined}
        data-ds-select-list=""
      >
        {rows.map((row, index) => (
          <RowProvider
            key={row.key}
            value={{
              presence: row.presence,
              onExited: () => exited(row.key),
            }}
          >
            {children(row.item, index)}
          </RowProvider>
        ))}
      </div>
    );
  };

  const Item = ({
    value,
    disabled = false,
    onClick,
    onPointerMove,
    children,
    ...props
  }: SelectItemProps<T>) => {
    const s = useSelect();
    const row = useRow();
    const id = useId();
    const ref = useRef<HTMLDivElement>(null);
    const selected = s.value !== null && s.toKey(s.value) === s.toKey(value);
    const leaving = row.presence === 'exit';
    const active = s.activeId === id;
    const onExit = useEffectEvent(() =>
      afterAnimations(ref.current!, row.onExited),
    );

    useEffect(() => {
      if (leaving) onExit();
    }, [leaving]);

    useEffect(() => {
      if (active) ref.current!.scrollIntoView({ block: 'nearest' });
    }, [active]);

    return (
      <div
        {...props}
        ref={ref}
        id={id}
        role="option"
        aria-selected={selected}
        aria-disabled={disabled || undefined}
        aria-hidden={leaving || undefined}
        data-ds-select-item=""
        data-active={active || undefined}
        data-presence={row.presence === 'stay' ? undefined : row.presence}
        onPointerMove={(event) => {
          onPointerMove?.(event);
          if (!disabled && !leaving && !active) s.setActiveId(id);
        }}
        onClick={(event) => {
          onClick?.(event);
          if (!disabled && !leaving && !event.defaultPrevented) s.choose(value);
        }}
      >
        <ItemProvider value={{ selected }}>{children}</ItemProvider>
      </div>
    );
  };

  const ItemIndicator = ({ children, ...props }: ComponentProps<'span'>) =>
    useItem().selected ? (
      <span {...props} aria-hidden="true" data-ds-select-indicator="">
        {children ?? <Check focusable="false" />}
      </span>
    ) : null;

  const Empty = ({ children, ...props }: SelectEmptyProps) => {
    const s = useSelect();
    if (s.count > 0) return null;
    return (
      <div {...props} role="status" data-ds-select-empty="">
        {typeof children === 'function' ? children(s.query) : children}
      </div>
    );
  };

  return {
    Root,
    Label,
    Control,
    Trigger,
    Value,
    Clear,
    Icon,
    Content,
    Search,
    List,
    Item,
    ItemIndicator,
    Empty,
    useSelect,
  };
};

export const Select = createSelect<string>();

export type {
  SelectContentProps,
  SelectEmptyProps,
  SelectItemProps,
  SelectListProps,
  SelectMode,
  SelectOptions,
  SelectRootProps,
  SelectSearchProps,
  SelectValueProps,
};
