import { Button } from '@/shared/ui/controls';

export const SocialButtons = () => (
  <div className="mt-6 space-y-2">
    <Button
      variant="ghost"
      disabled
      aria-disabled="true"
      data-e2e="auth:google"
    >
      Google
    </Button>
    <Button variant="ghost" disabled aria-disabled="true" data-e2e="auth:apple">
      Apple
    </Button>
  </div>
);
