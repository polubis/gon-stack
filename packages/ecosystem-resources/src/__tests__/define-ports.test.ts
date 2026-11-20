import { describe, expect, it } from 'vitest';
import { definePorts, validatePorts } from '../define-ports.ts';
import { allPorts, registry } from '../ports.ts';

const valid = {
  ranges: { dev: [4300, 4399], e2e: [4400, 4499] },
  ports: { dev: { app: 4301 }, e2e: { app: 4401 } },
} as const;

describe('port registry validation', () => {
  it('accepts unique ports inside dedicated ranges', () => {
    expect(definePorts(valid)).toEqual(valid);
  });

  it('rejects a port outside its range', () => {
    const problems = validatePorts({
      ranges: { dev: [4300, 4399] },
      ports: { dev: { app: 4400 } },
    });
    expect(problems).toEqual([
      'dev.app = 4400 is outside its range "dev" [4300, 4399]',
    ]);
  });

  it('rejects the same port used by two services', () => {
    const problems = validatePorts({
      ranges: { dev: [4300, 4399] },
      ports: { dev: { a: 4301, b: 4301 } },
    });
    expect(problems).toEqual(['dev.b = 4301 is already used by dev.a']);
  });

  it('rejects overlapping ranges', () => {
    const problems = validatePorts({
      ranges: { dev: [4300, 4399], e2e: [4399, 4499] },
      ports: { dev: { a: 4301 }, e2e: { a: 4401 } },
    });
    expect(problems.join()).toContain(
      '"dev" [4300, 4399] and "e2e" [4399, 4499] overlap',
    );
  });

  it('rejects privileged, fractional and too high ports', () => {
    const problems = validatePorts({
      ranges: { dev: [4300, 4399] },
      ports: { dev: { a: 80, b: 4300.5, c: 70000 } },
    });
    expect(problems).toHaveLength(3);
    expect(problems.join()).toContain('is not a port in 1024-65535');
  });

  it('rejects an inverted or invalid range', () => {
    expect(
      validatePorts({
        ranges: { dev: [4399, 4300] },
        ports: { dev: {} },
      }).join(),
    ).toContain('must be integers min <= max');
  });

  it('rejects groups that have ranges without ports and ports without ranges', () => {
    const problems = validatePorts({
      ranges: { dev: [4300, 4399] },
      ports: { e2e: { a: 4401 } },
    });
    expect(problems).toContain('range "dev" has no ports');
    expect(problems).toContain('ports "e2e" has no range');
  });

  it('throws every problem at once when configured badly', () => {
    expect(() =>
      definePorts({
        ranges: { dev: [4300, 4399] },
        ports: { dev: { a: 1, b: 4301, c: 4301 } },
      }),
    ).toThrow(/Invalid port registry:\n- .*\n- /s);
  });

  it('ships a valid monorepo registry with every port unique', () => {
    const all = allPorts();
    expect(validatePorts(registry)).toEqual([]);
    expect(new Set(all).size).toBe(all.length);
  });
});
