import { describe, expect, it } from 'vitest';
import { describeHistory } from '../domain/history-label';
import type { TaskHistoryEntry } from '../domain/models';

const entry = (patch: Partial<TaskHistoryEntry>): TaskHistoryEntry => ({
  id: 'h-1',
  kind: 'updated',
  field: null,
  from: null,
  to: null,
  at: '2026-11-10T10:00:00.000Z',
  bot: null,
  ...patch,
});

const updated = (
  field: NonNullable<TaskHistoryEntry['field']>,
  from: string | null,
  to: string | null,
) => describeHistory(entry({ field, from, to }));

describe('history label', () => {
  it('names the created task', () => {
    expect(describeHistory(entry({ kind: 'created', to: 'Raport' }))).toBe(
      'Utworzono zadanie „Raport”',
    );
  });

  it('shows the old and the new title', () => {
    expect(updated('title', 'Stary', 'Nowy')).toBe(
      'Zmieniono tytuł: „Stary” → „Nowy”',
    );
  });

  it('cuts a long text and collapses its line breaks', () => {
    const label = updated('title', 'a\nb', 'x'.repeat(100));

    expect(label).toContain('„a b”');
    expect(label).toContain(`„${'x'.repeat(60)}…”`);
  });

  it.each([
    [null, 'opis', 'Dodano opis: „opis”'],
    ['opis', null, 'Usunięto opis'],
    ['opis', 'inny', 'Zmieniono opis'],
  ])('describes a description going %s → %s', (from, to, expected) => {
    expect(updated('description', from, to)).toBe(expected);
  });

  it('shows category and priority by name', () => {
    expect(updated('category', 'Praca', 'Dom')).toBe(
      'Zmieniono kategorię: Praca → Dom',
    );
    expect(updated('priority', 'Niski', 'Wysoki')).toBe(
      'Zmieniono priorytet: Niski → Wysoki',
    );
  });

  it('tells sending to the backlog and planning apart from moving', () => {
    expect(updated('day', '2026-11-10', null)).toBe('Przeniesiono do backlogu');
    expect(updated('day', null, '2026-11-11')).toMatch(/^Zaplanowano na /);
    expect(updated('day', '2026-11-10', '2026-11-11')).toMatch(
      /^Zmieniono dzień: .+ → .+/,
    );
  });

  it('tells setting, changing and clearing the hour apart', () => {
    expect(updated('at', null, '09:30')).toBe('Ustawiono godzinę 09:30');
    expect(updated('at', '09:30', '10:00')).toBe(
      'Zmieniono godzinę: 09:30 → 10:00',
    );
    expect(updated('at', '10:00', null)).toBe('Usunięto godzinę');
  });

  it('tells finishing and progress both ways', () => {
    expect(updated('done', 'false', 'true')).toBe('Oznaczono jako zrobione');
    expect(updated('done', 'true', 'false')).toBe(
      'Cofnięto oznaczenie „zrobione”',
    );
    expect(updated('in_progress', 'false', 'true')).toBe('Rozpoczęto zadanie');
    expect(updated('in_progress', 'true', 'false')).toBe('Wstrzymano zadanie');
  });

  it('shows a move between steps by their names', () => {
    expect(updated('status', 'W trakcie', 'Review')).toBe(
      'Zmieniono status: W trakcie → Review',
    );
  });

  it('describes attachments and comments', () => {
    expect(
      describeHistory(entry({ kind: 'attachment_added', to: 'plan.pdf' })),
    ).toBe('Dodano załącznik „plan.pdf”');
    expect(
      describeHistory(entry({ kind: 'attachment_removed', from: 'plan.pdf' })),
    ).toBe('Usunięto załącznik „plan.pdf”');
    expect(describeHistory(entry({ kind: 'comment_added', to: 'Cześć' }))).toBe(
      'Dodano komentarz: „Cześć”',
    );
    expect(
      describeHistory(
        entry({ kind: 'comment_edited', from: 'Cześć', to: 'Hej' }),
      ),
    ).toBe('Zmieniono komentarz: „Cześć” → „Hej”');
    expect(
      describeHistory(entry({ kind: 'comment_removed', from: 'Hej' })),
    ).toBe('Usunięto komentarz: „Hej”');
  });
});
