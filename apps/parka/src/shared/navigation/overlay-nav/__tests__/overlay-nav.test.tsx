import { useState } from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import * as Dialog from '@radix-ui/react-dialog';
import { afterEach, describe, expect, it } from 'vitest';
import { SelectPopover } from '@/shared/ui/select-popover';
import { Provider } from '../presentation/context';
import { NavSlot } from '../presentation/nav-slot';

const Dlg = ({
  name,
  children,
}: {
  name: string;
  children?: React.ReactNode;
}) => (
  <Dialog.Root>
    <Dialog.Trigger>{`Otwórz ${name}`}</Dialog.Trigger>
    <Dialog.Portal>
      <Dialog.Content>
        <Dialog.Title>{name}</Dialog.Title>
        <Dialog.Description>opis</Dialog.Description>
        <Dialog.Close>{`Zamknij ${name}`}</Dialog.Close>
        {children}
      </Dialog.Content>
    </Dialog.Portal>
  </Dialog.Root>
);

const Host = () => {
  const [value, setValue] = useState('a');
  return (
    <Provider>
      <NavSlot placement="side">
        <nav aria-label="Nawigacja boczna">
          <a href="/app/">Finanse</a>
        </nav>
      </NavSlot>
      <NavSlot placement="bottom">
        <nav aria-label="Nawigacja dolna">
          <a href="/app/">Finanse</a>
        </nav>
      </NavSlot>
      <main>
        <SelectPopover label="Wybór" value={value}>
          {(close) => (
            <button
              type="button"
              onClick={() => {
                setValue('b');
                close();
              }}
            >
              Opcja B
            </button>
          )}
        </SelectPopover>
        <Dlg name="Pierwszy">
          <Dlg name="Drugi" />
        </Dlg>
      </main>
    </Provider>
  );
};

/** The nav is hidden when it is inert (unreachable and not announced). */
const hidden = (name: string) =>
  screen.getByRole('navigation', { name, hidden: true }).closest('[inert]') !==
  null;
const navHidden = () => hidden('Nawigacja dolna');

describe('mobile bottom nav while overlays are open', () => {
  it('stays visible with nothing open', () => {
    render(<Host />);

    expect(navHidden()).toBe(false);
    expect(screen.getAllByRole('link', { name: 'Finanse' })).toHaveLength(2);
  });

  it('hides while a select is open', async () => {
    const user = userEvent.setup();
    render(<Host />);

    await user.click(screen.getByRole('button', { name: /Wybór/ }));

    await screen.findByRole('button', { name: 'Opcja B' });
    expect(navHidden()).toBe(true);
  });

  it('returns after a choice in the select', async () => {
    const user = userEvent.setup();
    render(<Host />);
    await user.click(screen.getByRole('button', { name: /Wybór/ }));
    await screen.findByRole('button', { name: 'Opcja B' });

    await user.click(screen.getByRole('button', { name: 'Opcja B' }));

    await screen.findByRole('button', { name: /Wybór/ });
    expect(screen.queryByRole('button', { name: 'Opcja B' })).toBeNull();
    expect(navHidden()).toBe(false);
  });

  it('never hides the desktop side nav', async () => {
    const user = userEvent.setup();
    render(<Host />);

    await user.click(screen.getByRole('button', { name: 'Otwórz Pierwszy' }));

    expect(navHidden()).toBe(true);
    expect(hidden('Nawigacja boczna')).toBe(false);
  });

  it('hides while a dialog is open', async () => {
    const user = userEvent.setup();
    render(<Host />);

    await user.click(screen.getByRole('button', { name: 'Otwórz Pierwszy' }));

    expect(navHidden()).toBe(true);
  });

  it('returns when the dialog closes on Escape', async () => {
    const user = userEvent.setup();
    render(<Host />);
    await user.click(screen.getByRole('button', { name: 'Otwórz Pierwszy' }));

    await user.keyboard('{Escape}');

    expect(screen.queryByRole('dialog')).toBeNull();
    expect(navHidden()).toBe(false);
  });

  const stackTwoDialogs = async (user: ReturnType<typeof userEvent.setup>) => {
    render(<Host />);
    await user.click(screen.getByRole('button', { name: 'Otwórz Pierwszy' }));
    await user.click(screen.getByRole('button', { name: 'Otwórz Drugi' }));
  };

  it('stays hidden while two dialogs are stacked', async () => {
    const user = userEvent.setup();

    await stackTwoDialogs(user);

    expect(screen.getAllByRole('dialog', { hidden: true })).toHaveLength(2);
    expect(navHidden()).toBe(true);
  });

  it('stays hidden after the top of two stacked dialogs closes', async () => {
    const user = userEvent.setup();
    await stackTwoDialogs(user);

    await user.click(screen.getByRole('button', { name: 'Zamknij Drugi' }));

    expect(navHidden()).toBe(true);
  });

  it('returns once the last of two stacked dialogs closes', async () => {
    const user = userEvent.setup();
    await stackTwoDialogs(user);
    await user.click(screen.getByRole('button', { name: 'Zamknij Drugi' }));

    await user.click(screen.getByRole('button', { name: 'Zamknij Pierwszy' }));

    expect(navHidden()).toBe(false);
  });
});

afterEach(() => {
  delete document.documentElement.dataset.navCollapsed;
});

describe('floating button rail next to the bottom nav', () => {
  const state = () => document.documentElement.dataset.navCollapsed;

  it('stays still until the nav first hides', () => {
    render(<Host />);

    expect(state()).toBeUndefined();
  });

  it('glides while the nav hides and when it returns', async () => {
    const user = userEvent.setup();
    render(<Host />);

    await user.click(screen.getByRole('button', { name: 'Otwórz Pierwszy' }));
    await waitFor(() => expect(state()).toBe('true'));

    await user.keyboard('{Escape}');
    expect(state()).toBe('false');
  });
});
