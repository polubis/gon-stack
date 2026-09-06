import { GettingStartedCard } from './getting-started-card';
import { MobileExploreRow } from './mobile-explore-row';
import { MobileNav } from './mobile-nav';
import { PrivacyStatusCard } from './privacy-status-card';
import { ProfileHeader } from './profile-header';
import { Sidebar } from './sidebar';

export const Main = () => (
  <div data-e2e="dashboard:main" className="flex min-h-screen bg-slate-950">
    <Sidebar />

    <div className="flex-1">
      <MobileNav />

      <main className="mx-auto flex max-w-xl flex-col gap-6 px-4 pb-10 md:px-10 md:py-10">
        <ProfileHeader />
        <PrivacyStatusCard />
        <GettingStartedCard />
        <MobileExploreRow />
      </main>
    </div>
  </div>
);
