import { describe, expect, it } from 'vitest';
import { z } from 'zod';
import { BadRequest, InternalServer } from '../error-handling';
import { withZodSchema } from '../../adapter/zod';

const schema = withZodSchema({
  schema: () =>
    z.object({
      in: z.object({ name: z.string().min(1), age: z.coerce.number() }),
      out: z.object({ code: z.literal(200), name: z.string() }),
    }),
});

describe('zod procedure schema', () => {
  it('parses a valid input', async () => {
    await expect(schema.parseInput({ name: 'Ala', age: '3' })).resolves.toEqual(
      { name: 'Ala', age: 3 },
    );
  });

  it('rejects an invalid input as a bad request listing the fields', async () => {
    const failure = await schema.parseInput({ name: '' }).catch((e) => e);

    expect(failure).toBeInstanceOf(BadRequest);
    expect(failure.message).toMatch(/^Invalid request payload: /);
    expect(failure.message).toContain('name:');
    expect(failure.message).toContain('age:');
  });

  it('parses a valid output', async () => {
    await expect(
      schema.parseOutput({ code: 200, name: 'Ala' }),
    ).resolves.toEqual({ code: 200, name: 'Ala' });
  });

  it('turns an invalid output into an internal error with a fixed message', async () => {
    const failure = await schema.parseOutput({ code: 200 }).catch((e) => e);

    expect(failure).toBeInstanceOf(InternalServer);
    expect(failure.message).toBe('Invalid response payload');
  });

  it('builds the schema only once, on first use', async () => {
    let builds = 0;
    const lazy = withZodSchema({
      schema: () => {
        builds += 1;
        return z.object({ in: z.string(), out: z.string() });
      },
    });
    expect(builds).toBe(0);

    await lazy.parseInput('a');
    await lazy.parseOutput('b');

    expect(builds).toBe(1);
  });
});
