import { AppNav } from './app-nav';
import { useSyncedNavKey } from './use-synced-nav-key';

/** App layout nav: active tab follows URL + Astro view transitions. */
export const SyncedAppNav = () => {
  const active = useSyncedNavKey();
  return <AppNav active={active} />;
};
