import { describe, expect, it } from 'vitest';
import {
  isFrequent,
  rankSuggestions,
  topSuggestion,
  type Suggestion,
} from '../domain/suggestions';

const item = (value: string, patch: Partial<Suggestion> = {}): Suggestion => ({
  field: 'merchant',
  value,
  useCount: 1,
  lastUsed: null,
  ...patch,
});

const values = (list: Suggestion[]) => list.map((s) => s.value);

describe('ranking suggestions', () => {
  it('lists more used values first', () => {
    const list = [item('Lidl', { useCount: 2 }), item('Aldi', { useCount: 7 })];

    expect(values(rankSuggestions(list, 'merchant', ''))).toEqual([
      'Aldi',
      'Lidl',
    ]);
  });

  it('breaks a tie with the most recent use', () => {
    const list = [
      item('Lidl', { lastUsed: '2026-01-01T00:00:00Z' }),
      item('Aldi', { lastUsed: '2026-02-01T00:00:00Z' }),
    ];

    expect(values(rankSuggestions(list, 'merchant', ''))).toEqual([
      'Aldi',
      'Lidl',
    ]);
  });

  it('keeps only values containing the typed text, ignoring case and spaces', () => {
    const list = [item('Biedronka'), item('Lidl'), item('Dobry Sklep')];

    expect(values(rankSuggestions(list, 'merchant', '  BI '))).toEqual([
      'Biedronka',
    ]);
  });

  it('puts values starting with the text before those only containing it', () => {
    const list = [
      item('Sklep Alfa', { useCount: 9 }),
      item('Alfa', { useCount: 1 }),
    ];

    expect(values(rankSuggestions(list, 'merchant', 'alfa'))).toEqual([
      'Alfa',
      'Sklep Alfa',
    ]);
  });

  it('keeps fields apart', () => {
    const list = [item('Karta', { field: 'paymentMethod' }), item('Lidl')];

    expect(values(rankSuggestions(list, 'paymentMethod', ''))).toEqual([
      'Karta',
    ]);
  });

  it('does not change the given list', () => {
    const list = [item('B', { useCount: 1 }), item('A', { useCount: 5 })];

    rankSuggestions(list, 'merchant', '');

    expect(values(list)).toEqual(['B', 'A']);
  });
});

describe('filling a blank field', () => {
  it('picks the best ranked value', () => {
    const list = [item('Lidl', { useCount: 2 }), item('Aldi', { useCount: 7 })];

    expect(topSuggestion(list, 'merchant')).toBe('Aldi');
  });

  it('picks nothing when the field has no values', () => {
    expect(topSuggestion([item('Lidl')], 'paymentMethod')).toBeNull();
  });
});

describe('frequently used values', () => {
  it('knows a value used often enough, ignoring case and spaces', () => {
    const list = [item('Lidl', { useCount: 3 })];

    expect(isFrequent(list, 'merchant', ' LIDL ')).toBe(true);
  });

  it('does not count a rarely used value', () => {
    const list = [item('Lidl', { useCount: 2 })];

    expect(isFrequent(list, 'merchant', 'Lidl')).toBe(false);
  });

  it('does not count an unknown value', () => {
    expect(
      isFrequent([item('Lidl', { useCount: 9 })], 'merchant', 'Aldi'),
    ).toBe(false);
  });

  it('keeps fields apart', () => {
    const list = [item('Karta', { field: 'paymentMethod', useCount: 9 })];

    expect(isFrequent(list, 'merchant', 'Karta')).toBe(false);
  });
});
