import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { Main } from '../presentation/main';

const settings = (avatar: string | null) => ({
  profile: { name: 'Ada', email: 'ada@example.com' },
  notifications: {
    push: false,
    email: true,
    limitWarnings: true,
    receiptConfirmations: true,
    limitAlerts: true,
  },
  devices: [
    { id: 'device-1', name: 'Safari on iOS', type: 'mobile', avatar },
    {
      id: 'device-2',
      name: 'Chrome on Windows',
      type: 'desktop',
      avatar: null,
    },
  ],
});

let saved: ReturnType<typeof settings> | null = null;

describe('device avatars in settings', () => {
  beforeEach(() => {
    saved = null;
    vi.stubGlobal(
      'fetch',
      vi.fn(async (_url: string, init?: RequestInit) => ({
        json: async () => {
          if (init?.method !== 'PUT')
            return { code: 200, data: settings('cat') };
          saved = JSON.parse(String(init.body));
          return { code: 200, data: saved };
        },
      })),
    );
  });
  afterEach(() => vi.unstubAllGlobals());

  const group = async (name: string) =>
    screen.findByRole('radiogroup', { name: `Awatar urządzenia ${name}` });

  it('lists every device with its current avatar selected', async () => {
    render(<Main />);
    const ios = await group('Safari on iOS');

    expect(within(ios).getByRole('radio', { name: 'Kot' })).toBeChecked();
    expect(
      within(await group('Chrome on Windows')).getByRole('radio', {
        name: 'Domyślna ikona',
      }),
    ).toBeChecked();
  });

  it('saves the avatar picked for a device', async () => {
    const user = userEvent.setup();
    render(<Main />);
    const win = await group('Chrome on Windows');

    await user.click(within(win).getByRole('radio', { name: 'Rakieta' }));

    expect(within(win).getByRole('radio', { name: 'Rakieta' })).toBeChecked();
    await waitFor(() =>
      expect(saved?.devices.map((d) => d.avatar)).toEqual(['cat', 'rocket']),
    );
  });

  it('resets a device to the default icon', async () => {
    const user = userEvent.setup();
    render(<Main />);
    const ios = await group('Safari on iOS');

    await user.click(
      within(ios).getByRole('radio', { name: 'Domyślna ikona' }),
    );

    await waitFor(() =>
      expect(saved?.devices.map((d) => d.avatar)).toEqual([null, null]),
    );
  });
});
