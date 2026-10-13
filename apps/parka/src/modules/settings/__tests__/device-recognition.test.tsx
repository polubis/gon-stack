import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { Main } from '../presentation/main';

const NO_DETAILS = {
  model: null,
  os: null,
  browser: null,
  screen: null,
  customName: null,
  avatar: null,
};

const settings = () => ({
  profile: { name: 'Ada', email: 'ada@example.com' },
  notifications: {
    push: false,
    email: true,
    limitWarnings: true,
    receiptConfirmations: true,
    limitAlerts: true,
  },
  devices: [
    {
      ...NO_DETAILS,
      id: 'device-aaaa-a3f9',
      name: 'Chrome on Android',
      type: 'mobile',
      model: 'SM-S918B',
      os: 'Android 14',
      browser: 'Chrome',
      screen: '412×915',
    },
    {
      ...NO_DETAILS,
      id: 'device-bbbb-77c1',
      name: 'Chrome on Android',
      type: 'mobile',
      model: 'SM-S918B',
      os: 'Android 14',
      browser: 'Chrome',
      screen: '412×915',
      customName: 'Telefon Ani',
    },
  ],
});

let saved: ReturnType<typeof settings> | null = null;

describe('device recognition in settings', () => {
  beforeEach(() => {
    saved = null;
    window.localStorage.setItem('parka:device-id', 'device-aaaa-a3f9');
    vi.stubGlobal(
      'fetch',
      vi.fn(async (_url: string, init?: RequestInit) => ({
        json: async () => {
          if (init?.method !== 'PUT') return { code: 200, data: settings() };
          saved = JSON.parse(String(init.body));
          return { code: 200, data: saved };
        },
      })),
    );
  });
  afterEach(() => {
    vi.unstubAllGlobals();
    window.localStorage.clear();
  });

  const row = async (label: string) =>
    (await screen.findByText(label)).closest('li')!;

  it('names a device by its model, system and browser with its short id', async () => {
    render(<Main />);
    const first = await row('SM-S918B · Android 14 · Chrome');

    expect(
      within(first).getByText('SM-S918B · Android 14 · Chrome'),
    ).toBeInTheDocument();
    expect(within(first).getByText(/#a3f9/)).toBeInTheDocument();
    expect(within(first).getByText(/412×915/)).toBeInTheDocument();
  });

  it('shows the custom name instead of the built one', async () => {
    render(<Main />);
    const second = await row('Telefon Ani');

    expect(within(second).getByText('Telefon Ani')).toBeInTheDocument();
    expect(within(second).getByText(/#77c1/)).toBeInTheDocument();
  });

  it('marks only the current browser as this device', async () => {
    render(<Main />);
    const first = await row('SM-S918B · Android 14 · Chrome');
    const second = await row('Telefon Ani');

    expect(within(first).getByText('To urządzenie')).toBeInTheDocument();
    expect(within(second).queryByText('To urządzenie')).not.toBeInTheDocument();
  });

  it('saves a custom name typed for a device', async () => {
    const user = userEvent.setup();
    render(<Main />);
    const first = await row('SM-S918B · Android 14 · Chrome');

    await user.type(
      within(first).getByRole('textbox', { name: /Nazwa urządzenia/ }),
      'Mój telefon{Enter}',
    );

    await waitFor(() =>
      expect(saved?.devices.map((d) => d.customName)).toEqual([
        'Mój telefon',
        'Telefon Ani',
      ]),
    );
    expect(within(first).getByText('Mój telefon')).toBeInTheDocument();
  });

  it('clears a custom name with the x button', async () => {
    const user = userEvent.setup();
    render(<Main />);
    const second = await row('Telefon Ani');

    await user.click(
      within(second).getByRole('button', {
        name: /^Wyczyść: Nazwa urządzenia/,
      }),
    );
    await user.tab();

    await waitFor(() =>
      expect(saved?.devices.map((d) => d.customName)).toEqual([null, null]),
    );
    expect(
      within(second).getByText('SM-S918B · Android 14 · Chrome'),
    ).toBeInTheDocument();
  });

  it('highlights, focuses and announces the current device on identify', async () => {
    const user = userEvent.setup();
    render(<Main />);
    const first = await row('SM-S918B · Android 14 · Chrome');

    await user.click(
      screen.getByRole('button', { name: 'Rozpoznaj to urządzenie' }),
    );

    expect(first).toHaveFocus();
    expect(first).toHaveAttribute('data-highlighted');
    expect(
      screen.getByText(/^To urządzenie: SM-S918B · Android 14 · Chrome, #a3f9/),
    ).toBeInTheDocument();
  });

  it('cannot identify when this browser has no expenses yet', async () => {
    window.localStorage.setItem('parka:device-id', 'device-other');
    render(<Main />);
    await row('SM-S918B · Android 14 · Chrome');

    expect(
      screen.getByRole('button', { name: 'Rozpoznaj to urządzenie' }),
    ).toBeDisabled();
  });
});
