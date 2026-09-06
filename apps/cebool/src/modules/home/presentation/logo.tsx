import { copy } from './copy';

export const Logo = () => (
  <span
    data-e2e="home:logo"
    className="text-sm font-bold tracking-[0.22em] text-white"
  >
    {copy.brand}
  </span>
);
