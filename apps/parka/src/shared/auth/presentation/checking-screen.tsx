import { Loader2 } from 'lucide-react';

export const CheckingScreen = () => (
  <div
    role="status"
    aria-live="polite"
    className="flex min-h-dvh flex-col items-center justify-center gap-3 text-muted"
  >
    <Loader2
      aria-hidden
      className="size-8 animate-spin motion-reduce:animate-none"
    />
    <p>Sprawdzanie logowania…</p>
  </div>
);
