import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { ScreenHeader } from '../layout';

const arrive = (index: number, referrer: string) => {
  window.history.replaceState({ __TSR_index: index }, '');
  vi.spyOn(document, 'referrer', 'get').mockReturnValue(referrer);
};

describe('screen header back link', () => {
  afterEach(() => vi.restoreAllMocks());

  it('goes back in history after navigating inside the app', async () => {
    arrive(2, '');
    const back = vi.spyOn(window.history, 'back').mockImplementation(() => {});
    render(<ScreenHeader title="Kategorie" backHref="/app/settings/" />);

    await userEvent.click(screen.getByRole('link', { name: 'Wróć' }));

    expect(back).toHaveBeenCalledOnce();
  });

  it('keeps its own destination when opened directly', async () => {
    arrive(0, '');
    const back = vi.spyOn(window.history, 'back').mockImplementation(() => {});
    render(<ScreenHeader title="Kategorie" backHref="/app/settings/" />);

    await userEvent.click(screen.getByRole('link', { name: 'Wróć' }));

    expect(back).not.toHaveBeenCalled();
    expect(screen.getByRole('link', { name: 'Wróć' })).toHaveAttribute(
      'href',
      '/app/settings/',
    );
  });
});
