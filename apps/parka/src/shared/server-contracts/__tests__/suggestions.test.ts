import { describe, expect, it } from 'vitest';
import { recordSuggestionUseSchema } from '../schemas/suggestions';

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
