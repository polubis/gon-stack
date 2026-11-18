import { act, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { renderKnowledge } from './render-knowledge';
import { setupKnowledgeBackend, topic } from './knowledge-backend';

const backend = setupKnowledgeBackend();

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

const changeFromOutside = (domain: 'time' | 'finance' | 'knowledge') =>
  act(() => FakeEventSource.last?.emit({ domain }));

describe('knowledge live refresh', () => {
  it('shows a topic added over MCP without a reload', async () => {
    vi.stubGlobal('EventSource', FakeEventSource);
    backend.state.topics = [topic({ id: 't-1', title: 'Phrasal verbs' })];
    renderKnowledge();
    await screen.findByText('Phrasal verbs');

    backend.state.topics = [
      topic({ id: 't-1', title: 'Phrasal verbs' }),
      topic({ id: 't-2', title: 'Dodany przez MCP', position: 1 }),
    ];
    changeFromOutside('knowledge');

    expect(await screen.findByText('Dodany przez MCP')).toBeVisible();
  });

  it('keeps the topics on screen when the refresh fails', async () => {
    vi.stubGlobal('EventSource', FakeEventSource);
    backend.state.topics = [topic({ id: 't-1', title: 'Phrasal verbs' })];
    renderKnowledge();
    await screen.findByText('Phrasal verbs');

    const reads = backend.lists().length;
    backend.state.failReads = true;
    changeFromOutside('knowledge');

    await vi.waitFor(() =>
      expect(backend.lists().length).toBeGreaterThan(reads),
    );
    expect(screen.getByText('Phrasal verbs')).toBeVisible();
  });

  it('ignores a change of another module', async () => {
    vi.stubGlobal('EventSource', FakeEventSource);
    backend.state.topics = [topic({ id: 't-1', title: 'Phrasal verbs' })];
    renderKnowledge();
    await screen.findByText('Phrasal verbs');
    const reads = backend.lists().length;

    changeFromOutside('time');

    expect(backend.lists()).toHaveLength(reads);
  });
});
