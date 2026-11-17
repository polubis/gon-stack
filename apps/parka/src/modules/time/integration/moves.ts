import type { z } from 'zod';
import type { listTimeMovesSchema } from '@schemas/time';
import { API_ROUTER } from '@/shared/router/routes';
import type { Move } from '../domain/moves';

export const fetchMoves = async (from: string, to: string): Promise<Move[]> => {
  const response = await fetch(API_ROUTER.timeMoves({ from, to }), {
    headers: { Accept: 'application/json' },
  });
  const json = (await response.json()) as z.infer<
    ReturnType<typeof listTimeMovesSchema>
  >['out'];
  if (json.code !== 200) throw new Error(json.message);
  return json.data.items;
};
