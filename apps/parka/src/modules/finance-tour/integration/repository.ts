import type { z } from 'zod';
import type {
  finishFinanceTourSchema,
  getFinanceTourSchema,
} from '@schemas/finance-tour';
import { API_ROUTER } from '@/shared/router/routes';
import type { WalkthroughOutcome } from '@/shared/walkthrough/domain/models';

type GetOut = z.infer<ReturnType<typeof getFinanceTourSchema>>['out'];
type FinishOut = z.infer<ReturnType<typeof finishFinanceTourSchema>>['out'];

/** How the account ended the tour; `null` = never, so it is due. */
export const fetchOutcome = async (
  signal: AbortSignal,
): Promise<WalkthroughOutcome | null> => {
  const response = await fetch(API_ROUTER.financeTour(), {
    headers: { Accept: 'application/json' },
    signal,
  });
  const json = (await response.json()) as GetOut;
  if (json.code !== 200) throw new Error(json.message);
  if (!json.data) throw new Error('Missing finance tour state');
  return json.data.outcome;
};

export const saveOutcome = async (
  outcome: WalkthroughOutcome,
): Promise<void> => {
  const response = await fetch(API_ROUTER.financeTour(), {
    method: 'PUT',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ outcome }),
  });
  const json = (await response.json()) as FinishOut;
  if (json.code !== 200) throw new Error(json.message);
};
