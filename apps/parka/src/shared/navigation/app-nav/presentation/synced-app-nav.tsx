import { AppNav } from './app-nav';
import { SidebarNav } from './sidebar-nav';
import { useSyncedNavKey } from './use-synced-nav-key';

type Props = {
  placement: 'side' | 'bottom';
};

/** App layout nav: active tab follows URL + Astro view transitions. */
export const SyncedAppNav = ({ placement }: Props) => {
  const active = useSyncedNavKey();
  return placement === 'side' ? (
    <SidebarNav active={active} />
  ) : (
    <AppNav active={active} />
  );
};
