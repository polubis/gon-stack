import { act, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { renderTime } from './render-time';
import { task, setupTimeBackend } from './time-backend';

const backend = setupTimeBackend();

class FakeEventSource {
  static last: FakeEventSource | undefined;
  onmessage: ((event: { data: string }) => void) | null = null;
  onopen: (() => void) | null = null;
  constructor() {
    FakeEventSource.last = this;
  }
  close() {}
  emit(event: object) {
    this.onmessage?.({ data: JSON.stringify(event) });
  }
}

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
  FakeEventSource.last = undefined;
});

const changeFromOutside = (domain: 'time' | 'finance') =>
  act(() => FakeEventSource.last?.emit({ domain }));

describe('time live refresh', () => {
  it('shows a task added from outside without a reload', async () => {
    vi.stubGlobal('EventSource', FakeEventSource);
    backend.seed([task({ id: 't-1', title: 'Raport' })]);
    renderTime();
    await screen.findByText('Raport');

    backend.seed([
      task({ id: 't-1', title: 'Raport' }),
      task({ id: 't-2', title: 'Dodane przez MCP', at: '15:00' }),
    ]);
    changeFromOutside('time');

    expect(await screen.findByText('Dodane przez MCP')).toBeVisible();
    expect(screen.queryByText('Ładowanie danych')).toBeNull();
  });

  it('keeps the tasks on screen while the refresh runs', async () => {
    vi.stubGlobal('EventSource', FakeEventSource);
    backend.seed([task({ id: 't-1', title: 'Raport' })]);
    renderTime();
    await screen.findByText('Raport');

    backend.state.delayMs = 50;
    changeFromOutside('time');

    expect(screen.getByText('Raport')).toBeVisible();
    expect(screen.queryByText('Ładowanie danych')).toBeNull();
  });

  it('keeps the screen quiet when the refresh fails', async () => {
    vi.stubGlobal('EventSource', FakeEventSource);
    backend.seed([task({ id: 't-1', title: 'Raport' })]);
    renderTime();
    await screen.findByText('Raport');

    backend.state.failReads = true;
    changeFromOutside('time');
    await vi.waitFor(() =>
      expect(backend.reads().length).toBeGreaterThanOrEqual(2),
    );

    expect(screen.getByText('Raport')).toBeVisible();
    expect(screen.queryByText('Nie udało się wczytać zadań')).toBeNull();
  });

  it('ignores a change of another domain', async () => {
    vi.stubGlobal('EventSource', FakeEventSource);
    backend.seed([task({ id: 't-1', title: 'Raport' })]);
    renderTime();
    await screen.findByText('Raport');
    const reads = backend.reads().length;

    changeFromOutside('finance');

    expect(backend.reads()).toHaveLength(reads);
  });
});
