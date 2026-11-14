import { render, screen } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';
import { ScreenHeader } from '@/shared/ui/layout';
import { useOwnerEyebrow } from '../presentation/owner-eyebrow';

const device = (id: string) => ({
  id,
  name: 'Chrome on Android',
  type: 'mobile',
  model: null,
  os: null,
  browser: null,
  screen: null,
  customName: null,
  avatar: null,
});

const settings = (ids: string[]) => ({
  profile: { name: 'Ada' },
  notifications: {
    push: false,
    email: true,
    limitWarnings: true,
    receiptConfirmations: true,
    limitAlerts: true,
  },
  devices: ids.map(device),
});

const server = setupServer();

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

const View = () => (
  <ScreenHeader title="Finanse" eyebrow={useOwnerEyebrow('Twoje')} />
);

describe('owner eyebrow of main views', () => {
  it('says "Wasze" once more than one device writes to the account', async () => {
    server.use(
      http.get('/api/settings/', () =>
        HttpResponse.json({ code: 200, data: settings(['a', 'b']) }),
      ),
    );

    const { container } = render(<View />);

    await screen.findByText('Wasze');
    expect(container).not.toHaveTextContent('Twoje');
  });
});
