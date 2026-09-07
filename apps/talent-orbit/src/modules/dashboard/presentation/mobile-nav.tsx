import { Bell, Menu } from 'lucide-react';
import { copy } from './copy';

export const MobileNav = () => (
  <div
    data-e2e="dashboard:mobile-nav"
    className="flex items-center justify-between px-4 py-4 md:hidden"
  >
    <button
      type="button"
      aria-label={copy.mobileMenuLabel}
      data-e2e="dashboard:mobile-menu"
      className="text-white"
    >
      <Menu className="h-6 w-6" aria-hidden="true" />
    </button>
    <button
      type="button"
      aria-label={copy.notificationsLabel}
      data-e2e="dashboard:mobile-notifications"
      className="text-white"
    >
      <Bell className="h-6 w-6" aria-hidden="true" />
    </button>
  </div>
);
