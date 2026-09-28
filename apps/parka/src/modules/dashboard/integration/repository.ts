import type { Schema } from '@schemas/dashboard';
import { apiRoutes } from '@/shared/router';
import type { Month, Summary } from '../domain/models';
import { toSummary } from './mappers';

export const fetchSummary = async (
  month: Month,
  signal: AbortSignal,
): Promise<Summary> => {
  const response = await fetch(apiRoutes.dashboard({ month }), {
    headers: { Accept: 'application/json' },
    signal,
  });

  const json = (await response.json()) as Schema['out'];

  if (json.code !== 200) {
    throw new Error(json.message);
  }

  return toSummary(json.data);
};
