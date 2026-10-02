import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { Main } from '../presentation/main';
import { PERSISTENCE_KEY, STEPS } from '../configuration/constraints';

const navigateTo = vi.hoisted(() => vi.fn());

vi.mock('@/shared/router/navigation', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@/shared/router/navigation')>()),
  navigateTo,
}));

beforeEach(() => {
  window.localStorage.removeItem(PERSISTENCE_KEY);
  navigateTo.mockClear();
});

describe('Home landing works when', () => {
  it('shows the first step on open', () => {
    render(<Main />);

    screen.getByRole('heading', { name: STEPS[0].title });
  });

  it('walks through every step in order', async () => {
    const user = userEvent.setup();
    render(<Main />);

    for (const [index, step] of STEPS.entries()) {
      screen.getByRole('heading', { name: step.title });
      if (index < STEPS.length - 1) {
        await user.click(screen.getByRole('button', { name: step.cta }));
      }
    }
  });

  it('offers sign-in link on the last step', async () => {
    const user = userEvent.setup();
    render(<Main />);

    for (const step of STEPS.slice(0, -1)) {
      await user.click(screen.getByRole('button', { name: step.cta }));
    }

    screen.getByRole('link', { name: 'Zaloguj się' });
  });

  it('sends the user to sign-up after finishing', async () => {
    const user = userEvent.setup();
    render(<Main />);

    for (const step of STEPS) {
      await user.click(screen.getByRole('button', { name: step.cta }));
    }

    expect(navigateTo).toHaveBeenCalledWith('/sign-up/');
  });
});
