import { TriangleAlert } from 'lucide-react';
import { onBackClick } from '@/shared/router/navigation';
import { Button } from './controls';

type Props = {
  title: string;
  /** Stable technical code, e.g. `SIGN_IN_REJECTED`. */
  code: string;
  description: string;
  /** Omit when retrying means editing the fields first. */
  onRetry?: () => void;
  backHref: string;
};

/** Inline form error: `icon : title : tech-code : description : retry : back`. */
export const FormError = ({
  title,
  code,
  description,
  onRetry,
  backHref,
}: Props) => (
  <div
    role="alert"
    className="animate-view-enter rounded-2xl border border-danger-line bg-danger-soft p-4 motion-reduce:animate-none"
  >
    <div className="flex items-start gap-3">
      <TriangleAlert
        className="mt-0.5 size-5 shrink-0 text-danger"
        aria-hidden="true"
      />
      <div className="min-w-0 space-y-1">
        <h2 className="text-sm font-semibold text-ink">{title}</h2>
        <p className="font-mono text-xs text-danger">{code}</p>
        <p className="text-sm text-ink-soft [overflow-wrap:anywhere]">
          {description}
        </p>
      </div>
    </div>
    <div className="mt-3 flex flex-col gap-2">
      {onRetry ? (
        <Button data-e2e="ui:error-retry" onClick={onRetry}>
          Spróbuj ponownie
        </Button>
      ) : null}
      <Button variant="ghost" href={backHref} onClick={onBackClick}>
        Wróć
      </Button>
    </div>
  </div>
);
