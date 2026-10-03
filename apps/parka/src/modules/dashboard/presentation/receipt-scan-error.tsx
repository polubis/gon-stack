import { TriangleAlert } from 'lucide-react';
import { Button } from '@/shared/ui/controls';
import { ERROR_CODES } from '../configuration/constraints';

/** Error pattern: `title : tech-code : description : retry : back`. */
export const ReceiptScanError = ({
  description,
  onRetry,
  onBack,
}: {
  description: string;
  onRetry: () => void;
  onBack: () => void;
}) => (
  <div
    role="alert"
    data-e2e="dashboard:receipt-scan-error"
    className="flex flex-col items-center gap-3 rounded-2xl border border-danger-line bg-danger-soft px-4 py-6 text-center"
  >
    <TriangleAlert className="h-6 w-6 text-danger" aria-hidden="true" />
    <h3 className="text-base font-semibold text-ink">
      Nie udało się odczytać paragonu
    </h3>
    <p className="font-mono text-xs text-danger">{ERROR_CODES.scan}</p>
    <p className="text-sm text-ink-soft">{description}</p>
    <div className="flex w-full max-w-xs gap-2">
      <Button onClick={onRetry}>Spróbuj ponownie</Button>
      <Button variant="ghost" onClick={onBack}>
        Wróć
      </Button>
    </div>
  </div>
);
