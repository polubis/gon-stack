import { copy } from './copy';

export const Intro = () => (
  <>
    <p className="text-xs font-bold tracking-[0.2em] text-primary">
      {copy.header.eyebrow}
    </p>
    <h1 className="mt-3 font-display text-3xl font-bold leading-tight text-secondary sm:text-4xl">
      {copy.header.heading}
    </h1>
    <p className="mt-2 text-sm text-ink-light">{copy.header.lastUpdated}</p>
  </>
);
