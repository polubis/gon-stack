import { Button } from '@/shared/ui/controls';

export const SocialButtons = () => (
  <div className="mt-6 space-y-2">
    <Button
      variant="ghost"
      disabled
      aria-disabled="true"
      data-e2e="auth:google"
    >
      Zaloguj przez Google (wkrótce)
    </Button>
    <Button variant="ghost" disabled aria-disabled="true" data-e2e="auth:apple">
      Zaloguj przez Apple (wkrótce)
    </Button>
  </div>
);
