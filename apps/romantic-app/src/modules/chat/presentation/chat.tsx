/* eslint-disable no-constant-condition */
import {
  LoaderCircle,
  Plus,
  Search,
  SendHorizontal,
  Share2,
  Sparkles,
  Wifi,
} from 'lucide-react';
import { useChatContext } from './chat-context';

export default function ChatModule() {
  const ctx = useChatContext();

  const threads = ctx.$threadsList.use();
  const messages = ctx.$messagesList.use();
  const activeThread = ctx.$activeThread.use();

  return (
    <main className="variant-shell min-h-screen font-sans text-text-primary">
      <div className="mx-auto flex min-h-screen w-full max-w-[1360px] flex-col gap-4 p-4 md:gap-5 md:p-6 lg:flex-row">
        <aside className="variant-card flex w-full flex-col overflow-hidden lg:max-w-[320px]">
          <header className="variant-nav flex items-center justify-between border-b border-white/10 px-4 py-3">
            <div className="flex items-center gap-2">
              <span className="variant-pill">Threads</span>
              <span className="text-[0.75rem] text-text-tertiary">
                {threads.length} total
              </span>
            </div>
            <button
              type="button"
              className="variant-icon-button text-text-secondary"
              aria-label="Start new thread"
            >
              <Plus size={16} aria-hidden="true" />
            </button>
          </header>

          <div className="flex flex-col gap-2 p-3">
            <label
              htmlFor="thread-search"
              className="text-[0.6875rem] uppercase tracking-[0.16em] text-text-tertiary"
            >
              Search
            </label>
            <div className="relative">
              <Search
                size={14}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary"
                aria-hidden="true"
              />
              <input
                id="thread-search"
                type="text"
                placeholder="Search conversations…"
                name="search"
                autoComplete="off"
                className="variant-input w-full py-2 pl-8 pr-3 text-[0.875rem]"
              />
            </div>
          </div>

          <ul className="flex-1 space-y-2 overflow-y-auto px-2 pb-3">
            {threads.map((thread) => (
              <li key={thread.id}>
                <button
                  type="button"
                  className={[
                    'w-full rounded-xl border p-3 text-left transition',
                    thread.active
                      ? 'variant-option-active'
                      : 'variant-option border-white/10 hover:border-primary-300/40',
                  ].join(' ')}
                >
                  <div className="mb-1 flex items-start justify-between gap-2">
                    <p className="truncate text-[0.875rem] font-semibold">
                      {thread.title}
                    </p>
                    <span className="shrink-0 text-[0.6875rem] text-text-tertiary">
                      {thread.time}
                    </span>
                  </div>
                  <p className="truncate text-[0.75rem] text-text-secondary">
                    {thread.preview}
                  </p>
                  <div className="mt-2 flex items-center gap-2">
                    {thread.unread > 0 ? (
                      <span className="variant-pill text-[0.625rem] tracking-[0.12em]">
                        {thread.unread} New
                      </span>
                    ) : null}
                    {true ? (
                      <span
                        className="inline-flex items-center gap-1 text-[0.6875rem] text-warning"
                        aria-live="polite"
                      >
                        <LoaderCircle
                          size={12}
                          className="animate-spin motion-reduce:animate-none"
                          aria-hidden="true"
                        />
                        Syncing…
                      </span>
                    ) : null}
                    {thread.state === 'error' ? (
                      <span className="text-[0.6875rem] text-error">
                        Needs attention
                      </span>
                    ) : null}
                  </div>
                </button>
              </li>
            ))}
          </ul>
        </aside>

        <section className="variant-card flex min-h-[70vh] flex-1 flex-col overflow-hidden">
          <header className="variant-nav flex flex-wrap items-center justify-between gap-3 border-b border-white/10 px-4 py-3 md:px-5">
            <div className="min-w-0">
              <h1 className="truncate text-[1rem] font-semibold">
                {activeThread?.title}
              </h1>
              <p className="text-[0.75rem] text-text-tertiary">
                Chat GPT • Works
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="variant-pill variant-pill-secondary inline-flex items-center gap-1">
                <Sparkles size={12} aria-hidden="true" />
                Live
              </span>
              <button
                type="button"
                className="variant-button-ghost inline-flex items-center gap-1 px-3 py-2 text-[0.75rem] font-medium"
              >
                <Share2 size={13} aria-hidden="true" />
                Share
              </button>
            </div>
          </header>

          <div className="flex-1 space-y-4 overflow-y-auto px-3 py-4 md:px-5">
            {messages.map((message) => {
              if (message.role === 'system') {
                return (
                  <div
                    key={message.id}
                    className="mx-auto max-w-xl rounded-full border border-info/35 bg-info/10 px-4 py-2 text-center"
                  >
                    <p className="text-[0.75rem] text-text-secondary">
                      {message.body}
                    </p>
                  </div>
                );
              }

              const isUser = message.role === 'user';
              return (
                <div
                  key={message.id}
                  className={
                    isUser ? 'ml-auto max-w-[80%]' : 'mr-auto max-w-[80%]'
                  }
                >
                  <div
                    className={[
                      'rounded-2xl border px-4 py-3 text-[0.875rem] leading-relaxed',
                      isUser
                        ? 'border-primary-300/50 bg-primary-500/25 text-text-primary'
                        : 'border-secondary-300/40 bg-surface-50/80 text-text-secondary',
                    ].join(' ')}
                  >
                    {message.body}
                  </div>
                </div>
              );
            })}

            <div className="mr-auto max-w-[80%]">
              <div className="rounded-2xl border border-secondary-300/40 bg-surface-50/80 px-4 py-3">
                <p className="mb-2 text-[0.75rem] uppercase tracking-[0.14em] text-text-tertiary">
                  Assistant is thinking
                </p>
                <div className="flex items-center gap-2" aria-hidden="true">
                  <span className="h-2.5 w-2.5 animate-bounce rounded-full bg-secondary-300 motion-reduce:animate-none [animation-delay:-0.2s]" />
                  <span className="h-2.5 w-2.5 animate-bounce rounded-full bg-secondary-300 motion-reduce:animate-none [animation-delay:-0.1s]" />
                  <span className="h-2.5 w-2.5 animate-bounce rounded-full bg-secondary-300 motion-reduce:animate-none" />
                </div>
              </div>
            </div>
          </div>

          <footer className="border-t border-white/10 bg-surface-100/50 p-3 md:p-4">
            <div className="flex items-end gap-2">
              <textarea
                rows={2}
                name="message"
                placeholder="Write your next message…"
                aria-label="Message input"
                autoComplete="off"
                className="variant-input min-h-[84px] w-full resize-none px-3 py-2.5 text-[0.875rem]"
              />
              <button
                type="button"
                className="variant-button-primary inline-flex h-[42px] items-center gap-1 px-4 text-[0.875rem] font-semibold"
              >
                <SendHorizontal size={14} aria-hidden="true" />
                Send
              </button>
            </div>
            <div className="mt-2 flex items-center justify-between text-[0.6875rem] text-text-tertiary">
              <span>Shift + Enter for a new line</span>
              <span className="inline-flex items-center gap-1">
                <Wifi size={12} className="text-success" aria-hidden="true" />
                {true ? 'Connected' : false ? 'Reconnecting…' : 'Disconnected'}
              </span>
            </div>
          </footer>
        </section>
      </div>
    </main>
  );
}
