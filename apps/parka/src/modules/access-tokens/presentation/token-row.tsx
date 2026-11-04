import {
  CircleCheck,
  Clock,
  Loader2,
  Pause,
  PauseCircle,
  Play,
  Trash2,
  type LucideIcon,
} from 'lucide-react';
import { cn } from '@repo/react-kit/cn';
import { openModal } from '@/shared/router/modal-stack';
import { Button } from '@/shared/ui/controls';
import { Card } from '@/shared/ui/layout';
import { MODAL } from '../configuration/constraints';
import { formatWhen, maskToken } from '../domain/format';
import type { AccessToken, TokenId, TokenStatus } from '../domain/models';

const STATUS: Record<
  TokenStatus,
  { label: string; icon: LucideIcon; className: string }
> = {
  active: {
    label: 'Aktywny',
    icon: CircleCheck,
    className: 'bg-brand-soft text-brand-dark',
  },
  expired: {
    label: 'Wygasł',
    icon: Clock,
    className: 'border border-line-strong bg-track text-ink-soft',
  },
  revoked: {
    label: 'Wstrzymany',
    icon: PauseCircle,
    className: 'border border-line-strong bg-track text-ink-soft',
  },
};

const expiry = (token: AccessToken): string => {
  if (!token.expiresAt) return 'Bez wygaśnięcia';
  const when = formatWhen(token.expiresAt);
  return token.status === 'expired' ? `Wygasł ${when}` : `Wygasa ${when}`;
};

const Meta = ({
  label,
  children,
  ...rest
}: {
  label: string;
  children: string;
  'data-e2e'?: `access-tokens:last-used:${string}`;
}) => (
  <div className="flex flex-wrap gap-x-2">
    <dt className="text-ink-soft">{label}</dt>
    <dd className="font-medium" {...rest}>
      {children}
    </dd>
  </div>
);

export const TokenRow = ({
  token,
  busy,
  onResume,
}: {
  token: AccessToken;
  busy: boolean;
  onResume: (id: TokenId) => void;
}) => {
  const status = STATUS[token.status];
  const StatusIcon = status.icon;
  const paused = token.status === 'revoked';
  const ask = (kind: keyof typeof MODAL) => () =>
    openModal(`${MODAL[kind]}:${token.id}`);

  return (
    <Card
      as="li"
      data-e2e={`access-tokens:row:${token.id}`}
      className="space-y-3"
    >
      <div className="flex items-start justify-between gap-3">
        <h3 className="min-w-0 break-words text-sm font-semibold">
          {token.name}
        </h3>
        <span
          data-e2e={`access-tokens:status:${token.id}`}
          className={cn(
            'inline-flex shrink-0 items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium',
            status.className,
          )}
        >
          <StatusIcon className="h-3.5 w-3.5" aria-hidden="true" />
          {status.label}
        </span>
      </div>

      <code
        data-e2e={`access-tokens:mask:${token.id}`}
        className="block break-all rounded-lg bg-surface px-2 py-1.5 font-mono text-xs"
      >
        {maskToken(token.hint, token.tail)}
      </code>

      <dl className="space-y-1 text-xs">
        <Meta label="Utworzono">{formatWhen(token.createdAt)}</Meta>
        <Meta
          label="Ostatnio użyty"
          data-e2e={`access-tokens:last-used:${token.id}`}
        >
          {token.lastUsedAt ? formatWhen(token.lastUsedAt) : 'Nigdy'}
        </Meta>
        <Meta label="Ważność">{expiry(token)}</Meta>
      </dl>

      <div className="flex flex-wrap gap-2">
        {paused ? (
          <Button
            variant="ghost"
            className="w-auto px-3 py-2"
            data-e2e={`access-tokens:resume:${token.id}`}
            aria-label={`Wznów token ${token.name}`}
            disabled={busy}
            onClick={() => onResume(token.id as TokenId)}
          >
            {busy ? (
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
            ) : (
              <Play className="h-4 w-4" aria-hidden="true" />
            )}
            Wznów
          </Button>
        ) : (
          <Button
            variant="ghost"
            className="w-auto px-3 py-2"
            data-e2e={`access-tokens:revoke:${token.id}`}
            aria-label={`Wstrzymaj token ${token.name}`}
            disabled={busy}
            onClick={ask('revoke')}
          >
            {busy ? (
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
            ) : (
              <Pause className="h-4 w-4" aria-hidden="true" />
            )}
            Wstrzymaj
          </Button>
        )}
        <Button
          variant="danger"
          className="w-auto px-3 py-2"
          data-e2e={`access-tokens:delete:${token.id}`}
          aria-label={`Usuń token ${token.name}`}
          disabled={busy}
          onClick={ask('remove')}
        >
          <Trash2 className="h-4 w-4" aria-hidden="true" />
          Usuń
        </Button>
      </div>
    </Card>
  );
};
