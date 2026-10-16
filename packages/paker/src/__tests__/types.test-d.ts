import { actions } from '../actions.js';
import type { InferActions } from '../actions.js';
import { store } from '../store.js';
import type { InferStore } from '../store.js';
import { rxjs } from '../adapters/rxjs.js';
import type { Observable } from 'rxjs';
import { value } from '../value.js';
import type { InferValue } from '../value.js';

describe('types', () => {
  it('infers value type', () => {
    const count$ = value(1);
    const nullable$ = value<string | null>(null);

    expectTypeOf(count$.get()).toBeNumber();
    expectTypeOf(nullable$.get()).toEqualTypeOf<string | null>();
    expectTypeOf<InferValue<typeof count$>>().toBeNumber();
  });

  it('types keys for objects and arrays', () => {
    const user$ = value({ name: 'a', age: 1 });
    const list$ = value([1, 2]);

    expectTypeOf(user$.getKey('name')).toBeString();
    expectTypeOf(list$.getKey(0)).toBeNumber();
    // @ts-expect-error unknown key
    user$.getKey('nope');
    // @ts-expect-error wrong value type
    user$.setKey('age', 'x');
  });

  it('hides keys on primitives', () => {
    const count$ = value(1);

    // @ts-expect-error primitives have no keys
    count$.getKey('x');
  });

  it('keeps computed read-only', () => {
    const a$ = value(1);
    const text$ = value([a$], (a) => `${a}`);

    expectTypeOf(text$.get()).toBeString();
    // @ts-expect-error computed is read-only
    text$.set('x');
  });

  it('types store keys and whole state', () => {
    const s = store({ count: 1, name: 'a' });

    expectTypeOf(s.count$.get()).toBeNumber();
    expectTypeOf(s.get()).toEqualTypeOf<{ count: number; name: string }>();
    expectTypeOf<InferStore<typeof s>>().toEqualTypeOf<{
      count: number;
      name: string;
    }>();
    // @ts-expect-error unknown key
    void s.nope$;
  });

  it('types action args and async result', () => {
    const count$ = value(1);
    const a = actions(count$, {
      add: (current, by: number) => current + by,
      later: async (current) => current,
    });

    expectTypeOf(a.add).toEqualTypeOf<(by: number) => void>();
    expectTypeOf(a.later).toEqualTypeOf<() => Promise<void>>();
    expectTypeOf<InferActions<typeof a>['add']>().toEqualTypeOf<[number]>();
    // @ts-expect-error wrong arg type
    a.add('x');
  });

  it('keeps types through store, actions and rxjs composition', () => {
    const app = rxjs(
      actions(store({ count: 1, name: 'a' }), {
        incrementBy: (current, by: number) => ({
          ...current,
          count: current.count + by,
        }),
      }),
      ({ count$, incrementBy }) => {
        expectTypeOf(count$.get()).toBeNumber();
        expectTypeOf(incrementBy).toEqualTypeOf<(by: number) => void>();
        return {
          ADD: (event$: Observable<number>) => event$,
          RESET: (event$: Observable<void>) => event$,
        };
      },
    );

    type State = { count: number; name: string };
    expectTypeOf<InferStore<typeof app>>().toEqualTypeOf<State>();
    expectTypeOf<InferValue<typeof app.count$>>().toBeNumber();
    expectTypeOf<InferActions<typeof app>['incrementBy']>().toEqualTypeOf<
      [number]
    >();
    expectTypeOf(app.get()).toEqualTypeOf<State>();
    expectTypeOf(app.emit).parameter(0).toEqualTypeOf<'ADD' | 'RESET'>();
    app.emit('ADD', 1);
    app.emit('RESET');
    // @ts-expect-error unknown event
    app.emit('NOPE');
    // @ts-expect-error wrong payload
    app.emit('ADD', 'x');
  });
});
