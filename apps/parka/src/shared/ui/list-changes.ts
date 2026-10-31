import { useEffect, useState, type AnimationEvent } from 'react';

export type ChangePhase = 'idle' | 'in' | 'flash' | 'out';

export type ChangeEntry<T> = {
  key: string;
  item: T;
  phase: ChangePhase;
  /** Index among live items; -1 for a row that is leaving. */
  at: number;
};

type Known<T> = { item: T; sig: string; index: number };
type Ghost<T> = { key: string; item: T; index: number };
type State<T> = {
  scope: string;
  known: Map<string, Known<T>>;
  phases: Record<string, 'in' | 'flash'>;
  ghosts: Ghost<T>[];
};

const FLASH_MS = 1200;
const EXIT_MS = 300;
const IN_MS = 400;

/** No matchMedia (tests) counts as reduced: lists then change instantly. */
const reduced = () =>
  typeof window === 'undefined' ||
  typeof window.matchMedia !== 'function' ||
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const index = <T>(
  items: T[],
  getKey: (item: T) => string,
  getSig: (item: T) => string,
) =>
  new Map(
    items.map((item, i) => [
      getKey(item),
      { item, sig: getSig(item), index: i },
    ]),
  );

/**
 * Tracks a list between renders and tells each row what happened to it:
 * `in` (created), `flash` (updated), `out` (deleted, kept briefly so it can
 * leave). `scope` resets the baseline (filter, period) so switching views
 * never animates. No-op under reduced motion.
 */
export const useListChanges = <T>(
  items: T[],
  getKey: (item: NoInfer<T>) => string,
  scope = '',
  getSig: (item: NoInfer<T>) => string = JSON.stringify,
): ChangeEntry<T>[] => {
  const signature = items.map((i) => `${getKey(i)}:${getSig(i)}`).join('|');
  const [state, setState] = useState<State<T>>(() => ({
    scope,
    known: index(items, getKey, getSig),
    phases: {},
    ghosts: [],
  }));
  const [seen, setSeen] = useState(signature + scope);

  if (seen !== signature + scope) {
    setSeen(signature + scope);
    const known = index(items, getKey, getSig);
    if (scope !== state.scope || reduced()) {
      setState({ scope, known, phases: {}, ghosts: [] });
    } else {
      const phases = { ...state.phases };
      for (const [key, now] of known) {
        const before = state.known.get(key);
        if (!before) phases[key] = 'in';
        else if (before.sig !== now.sig) phases[key] = 'flash';
      }
      const gone = [...state.known]
        .filter(([key]) => !known.has(key))
        .map(([key, { item, index }]) => ({ key, item, index }));
      const ghosts = [
        ...state.ghosts.filter((g) => !known.has(g.key)),
        ...gone,
      ];
      setState({ scope, known, phases, ghosts });
    }
  }

  const { phases, ghosts } = state;
  const hasPhases = Object.keys(phases).length > 0;
  const hasGhosts = ghosts.length > 0;
  const hasIn = Object.values(phases).includes('in');
  // `in` clips overflow only while it grows; flash may outlast it.
  useEffect(() => {
    if (!hasIn) return;
    const timer = setTimeout(
      () =>
        setState((s) => ({
          ...s,
          phases: Object.fromEntries(
            Object.entries(s.phases).filter(([, phase]) => phase !== 'in'),
          ),
        })),
      IN_MS,
    );
    return () => clearTimeout(timer);
  }, [phases, hasIn]);
  useEffect(() => {
    if (!hasPhases) return;
    const timer = setTimeout(
      () => setState((s) => ({ ...s, phases: {} })),
      FLASH_MS,
    );
    return () => clearTimeout(timer);
  }, [phases, hasPhases]);
  useEffect(() => {
    if (!hasGhosts) return;
    const timer = setTimeout(
      () => setState((s) => ({ ...s, ghosts: [] })),
      EXIT_MS,
    );
    return () => clearTimeout(timer);
  }, [ghosts, hasGhosts]);

  const live: ChangeEntry<T>[] = items.map((item, at) => ({
    key: getKey(item),
    item,
    phase: phases[getKey(item)] ?? 'idle',
    at,
  }));
  for (const ghost of [...ghosts].sort((a, b) => a.index - b.index)) {
    live.splice(Math.min(ghost.index, live.length), 0, {
      key: ghost.key,
      item: ghost.item,
      phase: 'out',
      at: -1,
    });
  }
  return live;
};

const CLASSES: Record<ChangePhase, string> = {
  idle: '',
  in: 'animate-row-in overflow-hidden motion-reduce:animate-none',
  flash: 'animate-row-flash motion-reduce:animate-none',
  out: 'pointer-events-none animate-row-out overflow-hidden motion-reduce:animate-none',
};

/**
 * Staggered entrance for rows present at mount. Ends after its first run, so
 * a later phase change (flash) never replays it. Rows created later skip it.
 */
export const useEntrance = (phase: ChangePhase, enabled = true) => {
  const [mountPhase] = useState(phase);
  const [done, setDone] = useState(false);
  return {
    entering: enabled && mountPhase === 'idle' && !done,
    onAnimationEnd: (event: AnimationEvent<HTMLElement>) => {
      if (
        event.target === event.currentTarget &&
        event.animationName === 'item-in'
      )
        setDone(true);
    },
  };
};

/** Classes and a11y props for a row in the given phase; leaving rows are inert. */
export const changeProps = (phase: ChangePhase) => ({
  className: CLASSES[phase],
  'aria-hidden': phase === 'out' ? true : undefined,
  inert: phase === 'out' ? true : undefined,
});
