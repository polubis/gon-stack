import {
  LoaderCircle,
  Plus,
  Search,
  SendHorizontal,
  Share2,
  Sparkles,
  Wifi,
  WifiOff,
} from 'lucide-react';
import type { KeyboardEvent } from 'react';
import { useContext } from './context';

export const Chat = () => {
  const ctx = useContext();

  const isBootstrapping = ctx.useIsBootstrapping();
  const bootstrapError = ctx.useBootstrapError();
  const filteredThreads = ctx.useFilteredThreads();
  const activeThread = ctx.useActiveThread();
  const activeMessages = ctx.useActiveMessages();
  const draft = ctx.useDraft();
  const isSending = ctx.useIsSending();
  const assistantTyping = ctx.useAssistantTyping();
  const connection = ctx.useConnection();
  const errorMessage = ctx.useErrorMessage();
  const searchQuery = ctx.useSearchQuery();

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      ctx.sendMessage();
    }
  };

  if (bootstrapError) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-surface-0 p-4 font-sans">
        <div className="flex max-w-sm flex-col items-center gap-4 rounded-2xl border border-error/40 bg-surface-100/90 p-8 text-center shadow-[0_10px_28px_rgba(0,0,0,0.45)]">
          <WifiOff size={32} className="text-error" aria-hidden="true" />
          <p className="b2 text-text-secondary">{bootstrapError}</p>
          <button
            type="button"
            className="rounded-[0.625rem] bg-gradient-to-br from-primary-500 to-primary-400 px-5 py-2.5 text-sm font-semibold text-text-primary transition hover:from-primary-400 hover:to-primary-300 focus:outline-none focus:ring-2 focus:ring-primary-300/45"
            onClick={ctx.bootstrap}
          >
            Retry
          </button>
        </div>
      </main>
    );
  }

  return (
    <main
      className="min-h-screen bg-surface-0 font-sans text-text-primary"
      aria-busy={isBootstrapping}
    >
      <div className="mx-auto flex min-h-screen w-full max-w-[1360px] flex-col gap-4 p-4 md:gap-5 md:p-6 lg:flex-row">
        {/* Sidebar */}
        <aside
          className="flex w-full flex-col overflow-hidden rounded-2xl border border-secondary-300/30 bg-surface-100/90 shadow-[0_10px_28px_rgba(0,0,0,0.45)] lg:max-w-[320px]"
          aria-label="Conversation threads"
        >
          <header className="flex items-center justify-between border-b border-secondary-300/20 px-4 py-3">
            <div className="flex items-center gap-2">
              <span className="rounded-full border border-primary-300/70 bg-primary-500/30 px-2.5 py-0.5 text-[0.6875rem] font-semibold uppercase tracking-[0.14em] text-text-primary">
                Threads
              </span>
              <span className="c2 text-text-tertiary">
                {filteredThreads.length} total
              </span>
            </div>
            <button
              type="button"
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-secondary-300/30 bg-secondary-500/10 text-text-secondary transition hover:border-secondary-300/55 hover:bg-secondary-500/20 focus:outline-none focus:ring-2 focus:ring-primary-300/45"
              aria-label="Start new thread"
              disabled={isBootstrapping}
            >
              <Plus size={16} aria-hidden="true" />
            </button>
          </header>

          <div className="flex flex-col gap-2 p-3">
            <label htmlFor="thread-search" className="l2 text-text-tertiary">
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
                value={searchQuery}
                onChange={(e) => ctx.updateSearch(e.target.value)}
                className="w-full rounded-[0.625rem] border border-secondary-300/45 bg-surface-50/80 py-2 pl-8 pr-3 text-sm text-text-primary placeholder:text-text-tertiary focus:border-primary-300 focus:outline-none focus:ring-2 focus:ring-primary-300/45"
              />
            </div>
          </div>

          {isBootstrapping ? (
            <div className="flex flex-1 items-center justify-center gap-2 pb-6 text-text-tertiary">
              <LoaderCircle
                size={16}
                className="animate-spin motion-reduce:animate-none"
                aria-hidden="true"
              />
              <span className="b3">Loading threads…</span>
            </div>
          ) : (
            <ul
              className="flex-1 space-y-2 overflow-y-auto px-2 pb-3"
              role="listbox"
              aria-label="Thread list"
            >
              {filteredThreads.map((thread) => (
                <li key={thread.id} role="option" aria-selected={thread.active}>
                  <button
                    type="button"
                    className={[
                      'w-full rounded-xl border p-3 text-left transition',
                      thread.active
                        ? 'border-primary-300/50 bg-primary-500/25'
                        : 'border-secondary-300/20 hover:border-secondary-300/40 hover:bg-surface-200/30',
                    ].join(' ')}
                    onClick={() => ctx.selectThread(thread.id)}
                  >
                    <div className="mb-1 flex items-start justify-between gap-2">
                      <p className="truncate text-sm font-semibold text-text-primary">
                        {thread.title}
                      </p>
                      <span className="c2 shrink-0 text-text-tertiary">
                        {thread.time}
                      </span>
                    </div>
                    <p className="b3 truncate text-text-secondary">
                      {thread.preview}
                    </p>
                    <div className="mt-2 flex items-center gap-2">
                      {thread.unread > 0 && (
                        <span className="rounded-full border border-primary-300/70 bg-primary-500/30 px-2 py-0.5 text-[0.625rem] font-semibold uppercase tracking-[0.12em] text-text-primary">
                          {thread.unread} New
                        </span>
                      )}
                      {thread.state === 'loading' && (
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
                      )}
                      {thread.state === 'error' && (
                        <span className="c2 text-error">Needs attention</span>
                      )}
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </aside>

        {/* Main panel */}
        <section className="flex min-h-[70vh] flex-1 flex-col overflow-hidden rounded-2xl border border-secondary-300/30 bg-surface-100/90 shadow-[0_10px_28px_rgba(0,0,0,0.45)]">
          <header className="flex flex-wrap items-center justify-between gap-3 border-b border-secondary-300/20 px-4 py-3 md:px-5">
            <div className="min-w-0">
              <h1 className="truncate text-base font-semibold text-text-primary">
                {activeThread?.title ?? '—'}
              </h1>
              <p className="c2 text-text-tertiary">Claude AI • Active</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 rounded-full border border-secondary-300/70 bg-secondary-500/24 px-2.5 py-0.5 text-[0.6875rem] font-semibold text-text-primary">
                <Sparkles size={12} aria-hidden="true" />
                Live
              </span>
              <button
                type="button"
                className="inline-flex items-center gap-1 rounded-lg px-3 py-2 text-xs font-medium text-text-secondary transition hover:bg-surface-200/40 hover:text-text-primary focus:outline-none focus:ring-2 focus:ring-primary-300/45"
              >
                <Share2 size={13} aria-hidden="true" />
                Share
              </button>
            </div>
          </header>

          <div
            className="flex-1 space-y-4 overflow-y-auto px-3 py-4 md:px-5"
            aria-label="Messages"
            aria-live="polite"
          >
            {isBootstrapping ? (
              <div className="flex h-full items-center justify-center gap-2 text-text-tertiary">
                <LoaderCircle
                  size={20}
                  className="animate-spin motion-reduce:animate-none"
                  aria-hidden="true"
                />
                <span className="b2">Loading messages…</span>
              </div>
            ) : (
              <>
                {activeMessages.map((message) => {
                  if (message.role === 'system') {
                    return (
                      <div
                        key={message.id}
                        className="mx-auto max-w-xl rounded-full border border-info/35 bg-info/10 px-4 py-2 text-center"
                      >
                        <p className="b3 text-text-secondary">{message.body}</p>
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
                          'rounded-2xl border px-4 py-3 text-sm leading-relaxed',
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

                {assistantTyping && (
                  <div className="mr-auto max-w-[80%]">
                    <div className="rounded-2xl border border-secondary-300/40 bg-surface-50/80 px-4 py-3">
                      <p className="l2 mb-2 text-text-tertiary">
                        Assistant is thinking
                      </p>
                      <div
                        className="flex items-center gap-2"
                        aria-hidden="true"
                      >
                        <span className="h-2.5 w-2.5 animate-bounce rounded-full bg-secondary-300 motion-reduce:animate-none [animation-delay:-0.2s]" />
                        <span className="h-2.5 w-2.5 animate-bounce rounded-full bg-secondary-300 motion-reduce:animate-none [animation-delay:-0.1s]" />
                        <span className="h-2.5 w-2.5 animate-bounce rounded-full bg-secondary-300 motion-reduce:animate-none" />
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

          <footer className="border-t border-secondary-300/20 bg-surface-200/30 p-3 md:p-4">
            {errorMessage && connection === 'disconnected' && (
              <div
                className="mb-3 flex items-center gap-2 rounded-lg border border-error/40 bg-error/10 px-3 py-2"
                role="alert"
              >
                <WifiOff
                  size={14}
                  className="shrink-0 text-error"
                  aria-hidden="true"
                />
                <p className="b3 flex-1 text-text-secondary">{errorMessage}</p>
                <button
                  type="button"
                  className="b3 font-medium text-primary-300 underline hover:text-primary-200 focus:outline-none focus:ring-2 focus:ring-primary-300/45"
                  onClick={ctx.retryConnection}
                >
                  Retry
                </button>
              </div>
            )}

            <div className="flex items-end gap-2">
              <textarea
                rows={2}
                name="message"
                placeholder="Write your next message…"
                aria-label="Message input"
                autoComplete="off"
                value={draft}
                disabled={
                  isSending || isBootstrapping || connection === 'disconnected'
                }
                onChange={(e) => ctx.updateDraft(e.target.value)}
                onKeyDown={handleKeyDown}
                className="min-h-[84px] w-full resize-none rounded-[0.625rem] border border-secondary-300/45 bg-surface-50/80 px-3 py-2.5 text-sm text-text-primary placeholder:text-text-tertiary focus:border-primary-300 focus:outline-none focus:ring-2 focus:ring-primary-300/45 disabled:cursor-not-allowed disabled:border-secondary-300/20 disabled:bg-surface-50/40 disabled:text-text-tertiary"
              />
              <button
                type="button"
                disabled={
                  isSending ||
                  isBootstrapping ||
                  !draft.trim() ||
                  connection === 'disconnected'
                }
                onClick={ctx.sendMessage}
                className="inline-flex h-[42px] items-center gap-1 rounded-[0.625rem] bg-gradient-to-br from-primary-500 to-primary-400 px-4 text-sm font-semibold text-text-primary transition hover:from-primary-400 hover:to-primary-300 focus:outline-none focus:ring-2 focus:ring-primary-300/45 disabled:cursor-not-allowed disabled:from-primary-700 disabled:to-primary-600 disabled:text-text-tertiary"
                aria-label="Send message"
              >
                {isSending ? (
                  <LoaderCircle
                    size={14}
                    className="animate-spin motion-reduce:animate-none"
                    aria-hidden="true"
                  />
                ) : (
                  <SendHorizontal size={14} aria-hidden="true" />
                )}
                Send
              </button>
            </div>

            <div className="mt-2 flex items-center justify-between text-[0.6875rem] text-text-tertiary">
              <span>Ctrl + Enter to send · Shift + Enter for new line</span>
              <span
                className="inline-flex items-center gap-1"
                aria-live="polite"
                aria-atomic="true"
              >
                {connection === 'connected' && (
                  <>
                    <Wifi
                      size={12}
                      className="text-success"
                      aria-hidden="true"
                    />
                    Connected
                  </>
                )}
                {connection === 'reconnecting' && (
                  <>
                    <LoaderCircle
                      size={12}
                      className="animate-spin text-warning motion-reduce:animate-none"
                      aria-hidden="true"
                    />
                    Reconnecting…
                  </>
                )}
                {connection === 'disconnected' && (
                  <>
                    <WifiOff
                      size={12}
                      className="text-error"
                      aria-hidden="true"
                    />
                    Disconnected
                  </>
                )}
              </span>
            </div>
          </footer>
        </section>
      </div>
    </main>
  );
};
