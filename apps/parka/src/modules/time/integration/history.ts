import type { z } from 'zod';
import type { listTaskHistorySchema } from '@schemas/time';
import { API_ROUTER } from '@/shared/router/routes';
import type { TaskHistoryEntry, TaskId } from '../domain/models';

export const fetchHistory = async (id: TaskId): Promise<TaskHistoryEntry[]> => {
  const response = await fetch(API_ROUTER.timeTaskHistory(id), {
    headers: { Accept: 'application/json' },
  });
  const json = (await response.json()) as z.infer<
    ReturnType<typeof listTaskHistorySchema>
  >['out'];
  if (json.code !== 200) throw new Error(json.message);
  return json.data.items;
};
