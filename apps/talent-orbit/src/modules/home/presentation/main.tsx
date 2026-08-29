import { HeroPanel } from './hero-panel';
import { WelcomeContent } from './welcome-content';

export const Main = () => (
  <div data-e2e="home:main" className="flex min-h-dvh bg-slate-950 text-white">
    <HeroPanel />

    <div className="flex flex-1 flex-col items-center justify-center px-6 pb-52 pt-20 sm:px-10 lg:items-start lg:justify-center lg:px-20 lg:pb-44 xl:px-28">
      <WelcomeContent />
    </div>
  </div>
);
