import { Logo } from './logo';
import { copy } from './copy';

export const WelcomeContent = () => (
  <section className="flex w-full max-w-sm flex-col items-center lg:max-w-md lg:items-start">
    <Logo layout="inline" className="mb-12 lg:hidden" />

    <h1 className="text-center text-[1.75rem] font-bold leading-tight tracking-tight text-white sm:text-4xl lg:text-left">
      {copy.headline}
    </h1>
    <p className="mt-3 max-w-xs text-center text-[0.9375rem] leading-relaxed text-slate-400 lg:max-w-none lg:text-left lg:text-base">
      {copy.subtext}
    </p>

    <a
      href="/sign-in/"
      data-e2e="home:continue"
      className="mt-8 flex w-full items-center justify-center rounded-full bg-orange-500 px-6 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-orange-400"
    >
      {copy.continue}
    </a>

    <div className="mt-7 flex w-full items-center gap-4">
      <span className="h-px flex-1 bg-slate-800" />
      <span className="text-sm text-slate-400">{copy.divider}</span>
      <span className="h-px flex-1 bg-slate-800" />
    </div>

    <a
      href="#"
      data-e2e="home:join-exam"
      className="mt-7 self-center text-sm font-semibold text-orange-400 transition-colors hover:text-orange-300"
    >
      {copy.joinExam}
    </a>
  </section>
);
