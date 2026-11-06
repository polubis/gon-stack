import { selectStream } from '@repo/uih/select-stream';

const PARAM = 'select';

const write = (open: readonly string[]) => {
  const url = new URL(window.location.href);
  url.searchParams.delete(PARAM);
  open.forEach((id) => url.searchParams.append(PARAM, id));
  window.history.replaceState(window.history.state, '', url);
};

/**
 * App-side routing for selects: open ids live in `?select=` (open order),
 * so a deep link or reload reopens them. Driven only by `selectStream`.
 */
export const syncSelectsWithUrl = () => {
  new URLSearchParams(window.location.search)
    .getAll(PARAM)
    .forEach((id) => selectStream.open(id));
  return selectStream.subscribe((event) => write(event.open));
};
