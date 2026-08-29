import { Logo } from './logo';

export const HeroPanel = () => (
  <section
    aria-hidden="true"
    className="relative hidden w-1/2 overflow-hidden bg-slate-950 lg:flex lg:items-center lg:justify-center"
  >
    <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_30%_20%,rgba(59,130,246,0.12)_0%,transparent_55%),radial-gradient(ellipse_at_70%_80%,rgba(249,115,22,0.08)_0%,transparent_50%),radial-gradient(circle_at_50%_50%,rgba(15,23,42,0.4)_0%,transparent_70%)]" />
    <div className="pointer-events-none absolute inset-0 opacity-40 [background-image:radial-gradient(circle,rgba(255,255,255,0.55)_0.5px,transparent_0.5px)] [background-size:24px_24px]" />
    <Logo layout="stacked" />
  </section>
);
