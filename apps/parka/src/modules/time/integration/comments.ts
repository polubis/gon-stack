import type { z } from 'zod';
import type {
  createTaskCommentSchema,
  deleteTaskCommentSchema,
  listTaskCommentsSchema,
  updateTaskCommentSchema,
} from '@schemas/time';
import { API_ROUTER } from '@/shared/router/routes';
import type { CommentOwner, TaskComment, TaskId } from '../domain/models';

type Out<T extends () => z.ZodType<{ out: unknown }>> = z.infer<
  ReturnType<T>
>['out'];

/** Astro treats a body-less write as a form post: always send JSON. */
const JSON_HEADERS = { 'Content-Type': 'application/json' };

export const fetchComments = async (
  id: TaskId,
): Promise<{ owner: CommentOwner; items: TaskComment[] }> => {
  const response = await fetch(API_ROUTER.timeTaskComments(id), {
    headers: { Accept: 'application/json' },
  });
  const json = (await response.json()) as Out<typeof listTaskCommentsSchema>;
  if (json.code !== 200) throw new Error(json.message);
  return json.data;
};

export const postComment = async (
  id: TaskId,
  body: string,
): Promise<TaskComment> => {
  const response = await fetch(API_ROUTER.timeTaskComments(id), {
    method: 'POST',
    headers: JSON_HEADERS,
    body: JSON.stringify({ body }),
  });
  const json = (await response.json()) as Out<typeof createTaskCommentSchema>;
  if (json.code !== 201) throw new Error(json.message);
  return json.data;
};

export const putComment = async (
  id: string,
  body: string,
): Promise<TaskComment> => {
  const response = await fetch(API_ROUTER.timeCommentById(id), {
    method: 'PUT',
    headers: JSON_HEADERS,
    body: JSON.stringify({ body }),
  });
  const json = (await response.json()) as Out<typeof updateTaskCommentSchema>;
  if (json.code !== 200) throw new Error(json.message);
  return json.data;
};

export const removeComment = async (id: string): Promise<void> => {
  const response = await fetch(API_ROUTER.timeCommentById(id), {
    method: 'DELETE',
    headers: JSON_HEADERS,
  });
  const json = (await response.json()) as Out<typeof deleteTaskCommentSchema>;
  if (json.code !== 200) throw new Error(json.message);
};
