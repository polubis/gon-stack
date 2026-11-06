type SelectEvent = {
  type: 'open' | 'close';
  id: string;
  /** Ids open right after this event, oldest first. */
  open: readonly string[];
};

type SelectListener = (event: SelectEvent) => void;

type Controller = { setOpen: (open: boolean) => void };

const listeners = new Set<SelectListener>();
const controllers = new Map<string, Controller>();
/** Opens asked for before the select mounted (deep link, reload). */
const pending = new Set<string>();
let opened: readonly string[] = [];

const emit = (type: SelectEvent['type'], id: string) => {
  opened =
    type === 'open' ? [...opened, id] : opened.filter((item) => item !== id);
  const event = { type, id, open: opened };
  listeners.forEach((listener) => listener(event));
};

const command = (id: string, open: boolean) => {
  const controller = controllers.get(id);
  if (controller) controller.setOpen(open);
  else if (open) pending.add(id);
  else pending.delete(id);
};

/**
 * One global stream of every select. Read: `subscribe` / `getOpen`.
 * Write: `open(id)` / `close(id)` (queued until that select mounts).
 */
export const selectStream = {
  subscribe: (listener: SelectListener) => {
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  },
  getOpen: (): readonly string[] => opened,
  open: (id: string) => command(id, true),
  close: (id: string) => command(id, false),
  /** Internal: wiring used by `Select.Root`. */
  connect: (id: string, controller: Controller) => {
    controllers.set(id, controller);
    if (pending.delete(id)) controller.setOpen(true);
    return () => {
      if (controllers.get(id) === controller) controllers.delete(id);
    };
  },
  /** Internal: `Select.Root` reports its own transitions. */
  emit,
};

export type { SelectEvent, SelectListener };
