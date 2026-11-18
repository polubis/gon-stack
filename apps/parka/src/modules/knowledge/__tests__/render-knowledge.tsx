import { render } from '@testing-library/react';
import { vi } from 'vitest';
import { FabLayer } from '@/shared/navigation/overlay-nav/presentation/fab-rail';
import { Main } from '../presentation/main';

/** Opens the screen with the clock fixed to 2026-10-20 (month view unless the URL says otherwise). */
export const renderKnowledge = (search = '') => {
  vi.useFakeTimers({ toFake: ['Date'] });
  vi.setSystemTime(new Date(2026, 9, 20, 13, 40));
  window.history.replaceState(null, '', `/app/knowledge/${search}`);
  return render(
    <>
      <Main />
      <FabLayer />
    </>,
  );
};
