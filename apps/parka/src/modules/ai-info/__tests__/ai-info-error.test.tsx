import { fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { Main } from '../presentation/main';

let shouldThrow = true;

vi.mock('@/shared/ui/layout', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/shared/ui/layout')>();
  return {
    ...actual,
    ScreenHeader: (props: Parameters<typeof actual.ScreenHeader>[0]) => {
      if (shouldThrow) throw new Error('boom');
      return <actual.ScreenHeader {...props} />;
    },
  };
});

describe('ai info page failure', () => {
  afterEach(() => {
    shouldThrow = true;
    vi.restoreAllMocks();
  });

  it('shows an error with code, retry and way back when the view crashes', () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});

    render(<Main />);

    const alert = screen.getByRole('alert');
    expect(alert.textContent).toContain('Wystąpił błąd widoku AI');
    expect(alert.textContent).toContain('AI_INFO_RENDER');
    expect(alert.textContent).toContain('boom');
    expect(
      screen.getByRole('link', { name: 'Wróć' }).getAttribute('href'),
    ).toBe('/app/settings/');
  });

  it('recovers the view after retry', () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    render(<Main />);

    shouldThrow = false;
    fireEvent.click(screen.getByRole('button', { name: 'Spróbuj ponownie' }));

    expect(
      screen.getByRole('heading', { level: 1, name: 'AI — jak to działa' }),
    ).toBeTruthy();
    expect(screen.queryByRole('alert')).toBeNull();
  });
});
