import { PostgrestError } from '@supabase/supabase-js';
import { describe, expect, it } from 'vitest';
import { Conflict, InternalServer } from '../../core/error-handling';
import { fromSupabaseError } from '../supabase';

const postgresError = (code: string) =>
  new PostgrestError({ message: 'db failure', details: '', hint: '', code });

describe('fromSupabaseError', () => {
  it('reports a still referenced row as a conflict', () => {
    expect(fromSupabaseError(postgresError('23503'))).toBeInstanceOf(Conflict);
  });

  it('hides unknown database failures behind an internal error', () => {
    expect(fromSupabaseError(postgresError('XX000'))).toBeInstanceOf(
      InternalServer,
    );
  });
});
