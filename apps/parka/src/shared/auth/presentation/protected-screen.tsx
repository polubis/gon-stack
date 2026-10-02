import { Lock } from 'lucide-react';
import { Button } from '@/shared/ui/controls';
import { APP_ROUTER } from '@/shared/router/routes';

/** Signed-out fallback: explains the restriction; the user chooses to go on. */
export const ProtectedScreen = () => (
  <main className="flex min-h-dvh flex-col items-center justify-center gap-3 bg-surface px-4 text-center">
    <span className="grid size-12 place-items-center rounded-full bg-card text-ink-soft">
      <Lock className="size-6" aria-hidden="true" />
    </span>
    <h1 className="text-base font-semibold text-ink">
      Ta strona jest chroniona
    </h1>
    <p className="max-w-xs text-sm text-ink-soft">
      Zaloguj się, aby korzystać z aplikacji.
    </p>
    <div className="w-full max-w-xs">
      <Button href={APP_ROUTER.signIn()}>Przejdź do logowania</Button>
    </div>
  </main>
);
