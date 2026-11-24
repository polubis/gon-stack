import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Inbox } from 'lucide-react';
import { describe, expect, it, vi } from 'vitest';
import { EmptyState } from '../empty-state';
import { ErrorState } from '../error-state';
import { LoadingBanner } from '../loading-banner';
import { ScopeNote } from '../scope-note';

describe('empty state', () => {
  it('explains what is missing and offers the first action', () => {
    render(
      <EmptyState
        icon={Inbox}
        title="Brak wydatków"
        description="Dodaj pierwszy wydatek"
        action={<button type="button">Dodaj wydatek</button>}
      />,
    );

    expect(screen.getByRole('status')).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { level: 2, name: 'Brak wydatków' }),
    ).toBeInTheDocument();
    screen.getByText('Dodaj pierwszy wydatek');
    screen.getByRole('button', { name: 'Dodaj wydatek' });
  });

  it('uses a lower heading level inside a card', () => {
    render(
      <EmptyState
        icon={Inbox}
        variant="card"
        title="Brak limitów"
        description="Nic tu nie ma"
      />,
    );

    expect(
      screen.getByRole('heading', { level: 3, name: 'Brak limitów' }),
    ).toBeInTheDocument();
  });
});

describe('error state', () => {
  it('shows title, code and description as an alert', () => {
    render(
      <ErrorState
        title="Nie udało się wczytać"
        code="EXPENSES_LOAD"
        description="Spróbuj za chwilę"
        onRetry={() => {}}
        backHref="/dashboard"
      />,
    );

    const alert = screen.getByRole('alert');
    expect(alert).toHaveTextContent('Nie udało się wczytać');
    expect(alert).toHaveTextContent('EXPENSES_LOAD');
    expect(alert).toHaveTextContent('Spróbuj za chwilę');
  });

  it('retries on demand', async () => {
    const user = userEvent.setup();
    const onRetry = vi.fn();
    render(
      <ErrorState
        title="Błąd"
        code="X"
        description="d"
        onRetry={onRetry}
        backHref="/dashboard"
      />,
    );

    await user.click(screen.getByRole('button', { name: 'Spróbuj ponownie' }));

    expect(onRetry).toHaveBeenCalledOnce();
  });

  it('links back to the given place with a custom label', () => {
    render(
      <ErrorState
        title="Błąd"
        code="X"
        description="d"
        onRetry={() => {}}
        backHref="/settings"
        backLabel="Do ustawień"
      />,
    );

    expect(screen.getByRole('link', { name: 'Do ustawień' })).toHaveAttribute(
      'href',
      '/settings',
    );
  });
});

describe('loading banner', () => {
  it('announces loading while active', () => {
    render(<LoadingBanner active label="Odświeżanie" />);

    expect(screen.getByRole('status')).toHaveTextContent('Odświeżanie');
  });

  it('says nothing when idle', () => {
    render(<LoadingBanner active={false} />);

    expect(screen.getByRole('status')).toBeEmptyDOMElement();
  });
});

describe('scope note', () => {
  it('shows the message as a note', () => {
    render(<ScopeNote>Zmiana obejmie wszystkie powtórzenia</ScopeNote>);

    expect(screen.getByRole('note')).toHaveTextContent(
      'Zmiana obejmie wszystkie powtórzenia',
    );
  });
});
