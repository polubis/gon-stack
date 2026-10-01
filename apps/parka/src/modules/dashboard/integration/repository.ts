import type { Schema } from '@schemas/dashboard';
import { API_ROUTER } from '@/shared/router';
import type { Month, Range, Summary } from '../domain/models';
import { toSummary } from './mappers';

export const fetchSummary = async (
  month: Month,
  range: Range,
  signal: AbortSignal,
): Promise<Summary> => {
  const response = await fetch(
    API_ROUTER.dashboard({ month, trendMonths: Number(range) }),
    {
      headers: { Accept: 'application/json' },
      signal,
    },
  );

  const json = (await response.json()) as Schema['out'];

  if (json.code !== 200) {
    throw new Error(json.message);
  }

  return toSummary(json.data);
};
