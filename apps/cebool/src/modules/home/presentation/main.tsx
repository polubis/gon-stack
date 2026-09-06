import { Logo } from './logo';
import { copy } from './copy';

export const Main = () => (
  <div
    data-e2e="home:main"
    className="flex min-h-dvh flex-col items-center justify-center gap-6 bg-slate-950 px-6 text-center text-white"
  >
    <Logo />
    <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
      {copy.headline}
    </h1>
    <p className="max-w-md text-slate-400">{copy.subtext}</p>
  </div>
);
