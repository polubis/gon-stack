import { render } from '@testing-library/react';
import { vi } from 'vitest';
import type { TimeKind } from '../domain/models';
import { Main as Day } from '../presentation/day';
import { Main as Month } from '../presentation/month';
import { TimeScreen } from '../presentation/screen';
import { Main as Week } from '../presentation/week';
import { Main as Year } from '../presentation/year';

export const TODAY = '2026-10-20';

const VIEWS = { day: Day, week: Week, month: Month, year: Year };

/** Opens the screen on `date` with the clock fixed to `TODAY`, 13:40. */
export const renderTime = (
  kind: TimeKind = 'day',
  date = TODAY,
  extra = '',
) => {
  vi.useFakeTimers({ toFake: ['Date'] });
  vi.setSystemTime(new Date(2026, 9, 20, 13, 40));
  window.history.replaceState(null, '', `/app/time/?date=${date}${extra}`);
  const View = VIEWS[kind];
  return render(
    <TimeScreen kind={kind}>
      <View />
    </TimeScreen>,
  );
};
