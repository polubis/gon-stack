import { useState } from 'react';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { Field, Select } from '../controls';
import { SelectPopover } from '../select-popover';

const useDevice = (mobile: boolean) =>
  vi.stubGlobal(
    'matchMedia',
    (query: string) =>
      ({
        matches: mobile,
        media: query,
        addEventListener: () => {},
        removeEventListener: () => {},
      }) as unknown as MediaQueryList,
  );

const OPTIONS = [
  { value: 'a', label: 'Alfa' },
  { value: 'b', label: 'Beta' },
];

const Host = () => {
  const [value, setValue] = useState('a');
  return (
    <Field label="Litera">
      <Select options={OPTIONS} value={value} onValueChange={setValue} />
    </Field>
  );
};

const modals = () =>
  new URLSearchParams(window.location.search).getAll('modal');

describe('select on a phone', () => {
  beforeEach(() => {
    window.history.replaceState(null, '', '/');
    useDevice(true);
  });
  afterEach(() => vi.unstubAllGlobals());

  it('opens a full-screen picker with all options', async () => {
    render(<Host />);

    await userEvent.click(screen.getByRole('button', { name: /Litera/ }));

    const dialog = await screen.findByRole('dialog', { name: 'Litera' });
    expect(within(dialog).getAllByRole('option')).toHaveLength(2);
    expect(dialog.className).toContain('inset-0');
  });

  it('changes the value and closes after a choice', async () => {
    render(<Host />);
    await userEvent.click(screen.getByRole('button', { name: /Litera/ }));

    await userEvent.click(await screen.findByRole('option', { name: 'Beta' }));

    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
    expect(screen.getByRole('button', { name: /Litera/ })).toHaveTextContent(
      'Beta',
    );
  });

  it('closes on Back and leaves the URL', async () => {
    render(<Host />);
    await userEvent.click(screen.getByRole('button', { name: /Litera/ }));
    await screen.findByRole('dialog');

    window.history.back();

    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
    expect(modals()).toHaveLength(0);
  });
});

describe('select on a desktop', () => {
  beforeEach(() => {
    window.history.replaceState(null, '', '/');
    useDevice(false);
  });
  afterEach(() => vi.unstubAllGlobals());

  it('opens a dropdown listbox, not a dialog', async () => {
    render(<Host />);

    await userEvent.click(screen.getByRole('combobox', { name: /Litera/ }));

    expect(await screen.findByRole('listbox')).toBeTruthy();
    expect(screen.queryByRole('dialog')).toBeNull();
  });
});

describe('select popover', () => {
  afterEach(() => vi.unstubAllGlobals());

  const ui = (
    <SelectPopover label="Kolor" value="Zielony">
      {() => <p>Panel koloru</p>}
    </SelectPopover>
  );

  it('is a popover on a desktop', async () => {
    useDevice(false);
    render(ui);

    await userEvent.click(screen.getByRole('button', { name: /Kolor/ }));

    expect(screen.getByText('Panel koloru')).toBeTruthy();
    expect(screen.queryByRole('dialog', { name: 'Kolor' })).toBeNull();
  });

  it('is a full-screen picker on a phone', async () => {
    useDevice(true);
    render(ui);

    await userEvent.click(screen.getByRole('button', { name: /Kolor/ }));

    expect(await screen.findByRole('dialog', { name: 'Kolor' })).toBeTruthy();
    expect(screen.getByText('Panel koloru')).toBeTruthy();
  });
});
