import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { registerNavigator } from '@/shared/router/navigation';
import { Main } from '../presentation/main';
import { readHandlers, startBackend } from './dashboard-backend';

const server = startBackend();

const push = vi.fn();
// Page changes are recorded, modal-stack history changes stay real.
const pages = (path: string) => path.startsWith('/app/expenses/new');
registerNavigator({
  push: (path, state) =>
    pages(path)
      ? push(path)
      : window.history.pushState(state ?? null, '', path),
  replace: (path, state) =>
    window.history.replaceState(state ?? null, '', path),
});
afterEach(() => push.mockClear());

const ready = async () => {
  server.use(...readHandlers());
  const view = render(<Main />);
  await screen.findByRole('heading', { name: 'Kategorie' });
  return view;
};

describe('dashboard keyboard shortcuts', () => {
  it('N opens the new expense page', async () => {
    const user = userEvent.setup();
    await ready();

    await user.keyboard('n');

    expect(push).toHaveBeenCalledWith('/app/expenses/new/');
  });

  it('C opens the new recurring expense page', async () => {
    const user = userEvent.setup();
    await ready();

    await user.keyboard('c');

    expect(push).toHaveBeenCalledWith(
      expect.stringContaining('type=recurring'),
    );
  });

  it('does nothing while typing in a field', async () => {
    const user = userEvent.setup();
    await ready();
    const field = document.createElement('textarea');
    document.body.append(field);

    field.focus();
    await user.keyboard('nc');

    expect(push).not.toHaveBeenCalled();
    field.remove();
  });

  it('does nothing while a dialog is open', async () => {
    const user = userEvent.setup();
    await ready();
    await user.click(screen.getAllByRole('button', { name: /^Dodaj$/ })[0]!);
    await screen.findByRole('menu', { name: 'Dodaj' });

    await user.keyboard('n');

    expect(push).not.toHaveBeenCalled();
  });
});
