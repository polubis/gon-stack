import { Subject } from 'rxjs';
import { events, forward, skipOn } from '../adapters/rxjs.js';
import { value } from '../value.js';

describe('rxjs adapter', () => {
  it('emits value changes as events', () => {
    const count$ = value(1);
    const received: unknown[] = [];
    const subscription = events(count$).subscribe((e) => received.push(e));

    count$.set(2);
    subscription.unsubscribe();
    count$.set(3);

    expect(received).toEqual([{ current: 2, previous: 1 }]);
  });

  it('forwards stream into a value', () => {
    const input = new Subject<number>();
    const target$ = value(0);

    forward(input, target$);
    input.next(5);

    expect(target$.get()).toBe(5);
  });

  it('forwards mapped stream and can be stopped', () => {
    const input = new Subject<number>();
    const target$ = value('');

    const subscription = forward(input, target$, (n) => `n${n}`);
    input.next(1);
    subscription.unsubscribe();
    input.next(2);

    expect(target$.get()).toBe('n1');
  });

  it('skips emissions while the gate is on', () => {
    const input = new Subject<number>();
    const busy$ = value(true);
    const received: number[] = [];
    input.pipe(skipOn(busy$)).subscribe((n) => received.push(n));

    input.next(1);
    busy$.set(false);
    input.next(2);

    expect(received).toEqual([2]);
  });
});
