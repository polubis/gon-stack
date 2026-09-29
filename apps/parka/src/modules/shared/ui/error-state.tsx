import { TriangleAlert } from 'lucide-react';
import type { E2eId } from '@/__e2e__/selectors';
import { Button } from './controls';

type Props = {
  title: string;
  /** Stable technical code, e.g. `EXPENSES_LOAD`. */
  code: string;
  description: string;
  onRetry: () => void;
  backHref: string;
  backLabel?: string;
  'data-e2e'?: E2eId;
};

/** Error pattern: `title : tech-code : description : retry : back`. */
export const ErrorState = ({
  title,
  code,
  description,
  onRetry,
  backHref,
  backLabel = 'Wróć',
  'data-e2e': dataE2e,
}: Props) => (
  <div
    role="alert"
    data-e2e={dataE2e}
    className="flex flex-col items-center gap-3 rounded-2xl border border-danger-line bg-danger-soft px-4 py-6 text-center"
  >
    <span className="grid h-12 w-12 place-items-center rounded-full bg-card text-danger">
      <TriangleAlert className="h-6 w-6" aria-hidden="true" />
    </span>
    <h2 className="text-base font-semibold text-ink">{title}</h2>
    <p className="font-mono text-xs text-danger">{code}</p>
    <p className="text-sm text-ink-soft">{description}</p>
    <div className="flex w-full max-w-xs gap-2">
      <Button onClick={onRetry}>Spróbuj ponownie</Button>
      <Button variant="ghost" href={backHref}>
        {backLabel}
      </Button>
    </div>
  </div>
);
