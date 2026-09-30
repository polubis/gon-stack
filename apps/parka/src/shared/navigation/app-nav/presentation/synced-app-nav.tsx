import { AppNav } from './app-nav';
import { TopNav } from './top-nav';
import { useSyncedNavKey } from './use-synced-nav-key';

type Props = {
  placement: 'top' | 'bottom';
};

/** App layout nav: active tab follows URL + Astro view transitions. */
export const SyncedAppNav = ({ placement }: Props) => {
  const active = useSyncedNavKey();
  return placement === 'top' ? (
    <TopNav active={active} />
  ) : (
    <AppNav active={active} />
  );
};
