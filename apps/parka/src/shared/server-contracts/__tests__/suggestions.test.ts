import { describe, expect, it } from 'vitest';
import {
  deleteSuggestionSchema,
  recordSuggestionUseSchema,
  renameSuggestionSchema,
} from '../schemas/suggestions';

describe('suggestion contracts', () => {
  it('trims the value of a recorded use', () => {
    const parsed = recordSuggestionUseSchema().shape.in.parse({
      field: 'merchant',
      value: '  Biedronka ',
    });

    expect(parsed.value).toBe('Biedronka');
  });

  it.each([
    ['a blank value', { field: 'merchant', value: '   ' }],
    ['an unknown field', { field: 'category', value: 'Karta' }],
    ['a too long value', { field: 'merchant', value: 'x'.repeat(101) }],
  ])('rejects a recorded use with %s', (_, input) => {
    expect(recordSuggestionUseSchema().shape.in.safeParse(input).success).toBe(
      false,
    );
  });
});

describe('suggestion management contracts', () => {
  it('trims both names of a rename', () => {
    const parsed = renameSuggestionSchema().shape.in.parse({
      field: 'paymentMethod',
      value: ' Karta ',
      newValue: ' BLIK ',
    });

    expect(parsed).toEqual({
      field: 'paymentMethod',
      value: 'Karta',
      newValue: 'BLIK',
    });
  });

  it('rejects a blank new name', () => {
    expect(
      renameSuggestionSchema().shape.in.safeParse({
        field: 'merchant',
        value: 'Lidl',
        newValue: '  ',
      }).success,
    ).toBe(false);
  });

  it('rejects deleting an unknown field', () => {
    expect(
      deleteSuggestionSchema().shape.in.safeParse({
        field: 'category',
        value: 'Karta',
      }).success,
    ).toBe(false);
  });
});
