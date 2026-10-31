import { useEffect } from 'react';
import { KeyRound, Plus } from 'lucide-react';
import { ErrorBoundary } from '@repo/react-kit/error-boundary';
import { APP_ROUTER, API_ROUTER } from '@/shared/router/routes';
import {
  closeModal,
  openModal,
  useModalStack,
} from '@/shared/router/modal-stack';
import { Button } from '@/shared/ui/controls';
import { EmptyState } from '@/shared/ui/empty-state';
import { ErrorState } from '@/shared/ui/error-state';
import { Card, ScreenHeader } from '@/shared/ui/layout';
import { LoadingBanner } from '@/shared/ui/loading-banner';
import { Toast } from '@/shared/ui/toast';
import {
  CAPABILITIES,
  ERROR_CODES,
  MAX_TOKENS,
  MODAL,
  NOT_ALLOWED,
} from '../configuration/constraints';
import type { AccessToken, TokenId } from '../domain/models';
import { ConfirmDialog } from './confirm-dialog';
import { Provider, useContext } from './context';
import { CreateDialog } from './create-dialog';
import { RenameDialog } from './rename-dialog';
import { SecretDialog } from './secret-dialog';
import { ListSkeleton } from './skeleton';
import { TokenRow } from './token-row';

const CONFIRMS = [
  {
    modal: MODAL.rotate,
    title: (t: AccessToken) => `Zmienić token „${t.name}”?`,
    description:
      'Dostaniesz nowy token, a obecny przestanie działać od razu. Podłączeni klienci będą wymagali nowego tokenu.',
    confirmLabel: 'Zmień',
  },
  {
    modal: MODAL.revoke,
    title: (t: AccessToken) => `Wyłączyć token „${t.name}”?`,
    description:
      'Token przestanie działać od razu i nie da się go włączyć ponownie. Możesz wygenerować nowy.',
    confirmLabel: 'Wyłącz',
  },
  {
    modal: MODAL.remove,
    title: (t: AccessToken) => `Usunąć token „${t.name}”?`,
    description:
      'Token przestanie działać od razu, a wpis zniknie z listy. Tej operacji nie można cofnąć.',
    confirmLabel: 'Usuń',
  },
] as const;

const ACTION = {
  [MODAL.rotate]: 'rotate',
  [MODAL.revoke]: 'revoke',
  [MODAL.remove]: 'remove',
} as const;

/** Popups open in the URL stack: the form and the confirmations per token. */
const Modals = ({ tokens }: { tokens: AccessToken[] }) => {
  const ctx = useContext();
  const stack = useModalStack();

  return (
    <>
      {stack.map((entry) => {
        if (entry === MODAL.create)
          return <CreateDialog key={entry} modal={entry} />;

        const [kind, id] = entry.split(':');
        const confirm = CONFIRMS.find((c) => c.modal === kind);
        const token = tokens.find((t) => t.id === id);
        if (kind === MODAL.rename && token)
          return <RenameDialog key={entry} modal={entry} token={token} />;
        if (!confirm || !token) return null;

        return (
          <ConfirmDialog
            key={entry}
            modal={entry}
            title={confirm.title(token)}
            description={confirm.description}
            confirmLabel={confirm.confirmLabel}
            onClose={() => closeModal(entry)}
            onConfirm={() => {
              closeModal(entry);
              ctx[ACTION[confirm.modal]](token.id as TokenId);
            }}
          />
        );
      })}
    </>
  );
};

const AccessTokensView = () => {
  const ctx = useContext();
  const tokens = ctx.useTokens();
  const secret = ctx.useSecret();
  const busyIds = ctx.useBusyIds();
  const error = ctx.useError();
  const notice = ctx.useNotice();
  const initializing = ctx.useInitializing();
  const isLoading = ctx.useIsLoading();
  const full = tokens.length >= MAX_TOKENS;

  useEffect(() => {
    ctx.load();
  }, [ctx]);

  const add = () => openModal(MODAL.create);

  return (
    <div
      data-e2e="access-tokens:main"
      className="relative mx-auto flex w-full max-w-2xl flex-1 animate-view-enter flex-col motion-reduce:animate-none"
    >
      <LoadingBanner active={isLoading && !initializing} />
      <div className="md:px-4">
        <ScreenHeader
          title="Tokeny MCP"
          backHref={APP_ROUTER.settings()}
          action={
            <Button
              data-e2e="access-tokens:add"
              className="w-auto px-3 py-2"
              disabled={full}
              onClick={add}
            >
              <Plus className="h-4 w-4" aria-hidden="true" /> Generuj
            </Button>
          }
        />
      </div>
      <main className="flex flex-1 flex-col gap-4 px-4 pb-6 pt-2 md:px-8">
        {error ? (
          <ErrorState
            data-e2e="access-tokens:load-error"
            title="Nie udało się wczytać tokenów"
            code={ERROR_CODES.load}
            description={error}
            onRetry={ctx.load}
            backHref={APP_ROUTER.settings()}
          />
        ) : null}

        {initializing ? <ListSkeleton /> : null}

        {!initializing && !error ? (
          <>
            <Card as="section" className="space-y-2">
              <h2 className="text-sm font-semibold text-ink-soft">
                Serwer MCP
              </h2>
              <p className="text-sm text-ink-soft">
                Asystent AI połączony tokenem może:
              </p>
              <ul className="list-disc space-y-0.5 pl-5 text-sm">
                {CAPABILITIES.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
              <p className="text-xs text-ink-soft">{NOT_ALLOWED}</p>
              <code
                data-e2e="access-tokens:endpoint"
                className="block break-all rounded-lg bg-surface px-2 py-1.5 font-mono text-xs"
              >
                {`${window.location.origin}${API_ROUTER.mcp()}`}
              </code>
            </Card>

            {tokens.length === 0 ? (
              <EmptyState
                data-e2e="access-tokens:empty"
                icon={KeyRound}
                title="Nie masz jeszcze tokenów"
                description="Wygeneruj token, aby połączyć asystenta AI z zadaniami i wydatkami."
                action={
                  <Button className="w-auto px-3 py-2" onClick={add}>
                    <Plus className="h-4 w-4" aria-hidden="true" /> Generuj
                    token
                  </Button>
                }
              />
            ) : (
              <ul
                className="flex flex-col gap-3"
                data-e2e="access-tokens:list"
                aria-label="Tokeny"
              >
                {tokens.map((token) => (
                  <TokenRow
                    key={token.id}
                    token={token}
                    busy={busyIds.includes(token.id)}
                  />
                ))}
              </ul>
            )}

            {full ? (
              <p className="text-xs text-ink-soft">
                Limit {MAX_TOKENS} tokenów. Usuń nieużywany, aby dodać nowy.
              </p>
            ) : null}
          </>
        ) : null}
      </main>

      <Modals tokens={tokens} />
      {secret ? (
        <SecretDialog secret={secret} onDone={ctx.dismissSecret} />
      ) : null}

      {notice ? (
        <Toast
          key={notice.id}
          data-e2e="access-tokens:toast"
          notice={notice}
          onClose={ctx.dismissNotice}
        />
      ) : null}
    </div>
  );
};

export const Main = () => (
  <ErrorBoundary
    fallback={({ error, reset }) => (
      <ErrorState
        title="Wystąpił błąd widoku tokenów"
        code={ERROR_CODES.render}
        description={error.message}
        onRetry={reset}
        backHref={APP_ROUTER.settings()}
      />
    )}
  >
    <Provider>
      <AccessTokensView />
    </Provider>
  </ErrorBoundary>
);
