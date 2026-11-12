import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { AddMenu } from '@/modules/dashboard/presentation/add-menu';

const desktop = () =>
  vi.stubGlobal(
    'matchMedia',
    (query: string) =>
      ({
        matches: false,
        media: query,
        addEventListener: () => {},
        removeEventListener: () => {},
      }) as unknown as MediaQueryList,
  );

const modals = () =>
  new URLSearchParams(window.location.search).getAll('modal');

describe('popover on a desktop', () => {
  beforeEach(() => {
    window.history.replaceState(null, '', '/');
    desktop();
  });
  afterEach(() => vi.unstubAllGlobals());

  it('keeps itself in the URL while open', async () => {
    render(<AddMenu side="top">Dodaj</AddMenu>);

    await userEvent.click(screen.getByRole('button', { name: 'Dodaj' }));

    expect(modals()).toEqual(['popover:add-menu:top']);
  });

  it('closes on Back and reopens on Forward', async () => {
    render(<AddMenu side="top">Dodaj</AddMenu>);
    await userEvent.click(screen.getByRole('button', { name: 'Dodaj' }));

    window.history.back();
    await vi.waitFor(() => expect(screen.queryByRole('menu')).toBeNull());
    window.history.forward();

    expect(await screen.findByRole('menu')).toBeTruthy();
  });
});

describe('popover over the page', () => {
  beforeEach(() => {
    window.history.replaceState(null, '', '/');
    desktop();
  });
  afterEach(() => vi.unstubAllGlobals());

  it('blocks the elements below while open', async () => {
    render(
      <>
        <AddMenu side="top">Dodaj</AddMenu>
        <button type="button">Element listy</button>
      </>,
    );

    await userEvent.click(screen.getByRole('button', { name: 'Dodaj' }));
    await screen.findByRole('menu');

    expect(document.body.style.pointerEvents).toBe('none');
  });

  it('gives the page back once closed', async () => {
    render(<AddMenu side="top">Dodaj</AddMenu>);
    await userEvent.click(screen.getByRole('button', { name: 'Dodaj' }));
    await screen.findByRole('menu');

    await userEvent.keyboard('{Escape}');

    await vi.waitFor(() =>
      expect(document.body.style.pointerEvents).not.toBe('none'),
    );
  });
});
