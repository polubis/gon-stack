import type z from 'zod';
import { describe, expectTypeOf, it } from 'vitest';
import {
  recordSuggestionUseSchema,
  renameSuggestionSchema,
} from '../schemas/suggestions';

type RecordInput = z.infer<ReturnType<typeof recordSuggestionUseSchema>>['in'];
type RenameInput = z.infer<ReturnType<typeof renameSuggestionSchema>>['in'];

describe('suggestion contract types', () => {
  it('takes only a known field and a text value to record a use', () => {
    expectTypeOf<RecordInput>().toEqualTypeOf<{
      field: 'merchant' | 'paymentMethod';
      value: string;
    }>();

    // @ts-expect-error an unknown field is not part of the contract
    const unknownField: RecordInput = { field: 'category', value: 'Karta' };
    expectTypeOf(unknownField).toEqualTypeOf<RecordInput>();
  });

  it('needs both names to rename a remembered value', () => {
    expectTypeOf<RenameInput>().toHaveProperty('field');

    // @ts-expect-error a rename without a new name does not type-check
    const missingName: RenameInput = { field: 'merchant' };
    expectTypeOf(missingName).toEqualTypeOf<RenameInput>();
  });
});
