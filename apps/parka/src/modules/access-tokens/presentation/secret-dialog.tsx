import { useState } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { Check, Copy, TriangleAlert } from 'lucide-react';
import { API_ROUTER } from '@/shared/router/routes';
import { Button } from '@/shared/ui/controls';
import type { Secret } from '../domain/models';

type Props = {
  secret: Secret;
  onDone: () => void;
};

const connectCommand = (token: string): string =>
  `claude mcp add --transport http parka ${window.location.origin}${API_ROUTER.mcp()} --header "Authorization: Bearer ${token}"`;

/**
 * The one and only reveal of a secret. Held in memory (not in the URL), so a
 * reload loses it by design; the outside click does not close it by accident.
 */
export const SecretDialog = ({ secret, onDone }: Props) => {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(secret.token);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  };

  return (
    <Dialog.Root
      open
      onOpenChange={(open) => {
        if (!open) onDone();
      }}
    >
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-(--z-modal) bg-overlay" />
        <Dialog.Content
          data-e2e="access-tokens:secret-dialog"
          onInteractOutside={(e) => e.preventDefault()}
          className="fixed inset-x-4 bottom-4 z-(--z-modal) mx-auto max-h-[calc(100dvh-2rem)] max-w-md animate-pop-in overflow-y-auto rounded-2xl bg-card p-4 shadow-popover focus:outline-none motion-reduce:animate-none lg:bottom-auto lg:top-1/2 lg:-translate-y-1/2"
        >
          <Dialog.Title className="text-base font-semibold">
            {secret.kind === 'created' ? 'Twój nowy token' : 'Token zmieniony'}
          </Dialog.Title>
          <Dialog.Description className="mt-1 text-sm text-ink-soft">
            „{secret.name}”. Skopiuj go teraz: po zamknięciu tego okna nie
            zobaczysz go ponownie.
          </Dialog.Description>

          <p className="mt-3 flex items-start gap-2 rounded-xl border border-danger-line bg-danger-soft p-3 text-xs text-ink">
            <TriangleAlert
              className="mt-0.5 h-4 w-4 shrink-0 text-danger"
              aria-hidden="true"
            />
            Każdy, kto zna token, ma dostęp do Twoich zadań i wydatków. Nie
            wysyłaj go nikomu i nie zapisuj w publicznych plikach.
          </p>

          <code
            data-e2e="access-tokens:secret"
            className="mt-3 block select-all break-all rounded-xl border border-line-strong bg-surface p-3 font-mono text-xs"
          >
            {secret.token}
          </code>

          <Button
            variant="ghost"
            className="mt-3"
            data-e2e="access-tokens:secret-copy"
            onClick={copy}
          >
            {copied ? (
              <Check className="h-4 w-4" aria-hidden="true" />
            ) : (
              <Copy className="h-4 w-4" aria-hidden="true" />
            )}
            {copied ? 'Skopiowano' : 'Kopiuj token'}
          </Button>
          <p role="status" className="sr-only">
            {copied ? 'Token skopiowany do schowka' : ''}
          </p>

          <details className="mt-3 text-xs text-ink-soft">
            <summary className="cursor-pointer font-medium text-ink">
              Jak podłączyć klienta
            </summary>
            <pre className="mt-2 overflow-x-auto whitespace-pre-wrap break-all rounded-xl bg-surface p-3 font-mono">
              {connectCommand(secret.token)}
            </pre>
          </details>

          <Button
            className="mt-4"
            data-e2e="access-tokens:secret-done"
            onClick={onDone}
          >
            Gotowe
          </Button>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};
