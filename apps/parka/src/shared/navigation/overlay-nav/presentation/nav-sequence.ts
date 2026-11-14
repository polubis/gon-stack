import { useSyncExternalStore } from 'react';

/**
 * Overlay choreography, one step at a time. Each step starts when the
 * previous one's transitions have finished (Web Animations `finished`), never
 * after a guessed delay:
 *
 * open:  rest -> navOut (bottom nav slides away) -> fabDown (add button moves
 *        into its place) -> ready (the menu may appear)
 * close: ready -> fabUp (add button moves back) -> rest (nav slides in)
 *
 * Only transform and opacity move (compositor); the layout never changes. A
 * step whose element is not rendered or has nothing to animate (desktop,
 * `motion-reduce`) ends at once. Reversing mid-sequence cancels the running
 * step and takes the shortest way back, so rapid toggling cannot lock it.
 */
type Stage = 'rest' | 'navOut' | 'fabDown' | 'ready' | 'fabUp';

const listeners = new Set<() => void>();
const intents = new Set<string>();
let stage: Stage = 'rest';
let overlayOpen = false;
let nav: HTMLElement | null = null;
let fab: HTMLElement | null = null;
let run = 0;

const wanted = () => overlayOpen || intents.size > 0;

const settle = (el: HTMLElement | null, done: () => void) => {
  if (!el || el.getClientRects().length === 0) return done();
  requestAnimationFrame(() => {
    const running = el.getAnimations?.() ?? [];
    void Promise.allSettled(
      running.map((animation) => animation.finished),
    ).then(done);
  });
};

const set = (next: Stage) => {
  stage = next;
  const current = ++run;
  listeners.forEach((listener) => listener());
  const el =
    next === 'navOut'
      ? nav
      : next === 'rest' || next === 'ready'
        ? undefined
        : fab;
  if (el === undefined) return;
  settle(el, () => {
    if (current !== run) return;
    set(next === 'navOut' ? 'fabDown' : next === 'fabDown' ? 'ready' : 'rest');
  });
};

const reconcile = () => {
  const want = wanted();
  if (stage === 'rest' && want) set('navOut');
  else if (stage === 'navOut' && !want) set('rest');
  else if ((stage === 'fabDown' || stage === 'ready') && !want) set('fabUp');
  else if (stage === 'fabUp' && want) set('fabDown');
};

const subscribe = (listener: () => void) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};

export const useStage = (): Stage =>
  useSyncExternalStore(
    subscribe,
    () => stage,
    () => 'rest',
  );

/** Whether any overlay (dialog, popover, select...) is open on the page. */
export const setOverlayOpen = (open: boolean) => {
  overlayOpen = open;
  reconcile();
};

/** An overlay about to open (or open) that waits for the sequence. */
export const setIntent = (id: string, on: boolean) => {
  if (on) intents.add(id);
  else intents.delete(id);
  reconcile();
};

export const registerNav = (el: HTMLElement | null) => {
  nav = el;
  return () => {
    if (nav === el) nav = null;
  };
};

export const registerFab = (el: HTMLElement | null) => {
  fab = el;
  return () => {
    if (fab === el) fab = null;
  };
};
