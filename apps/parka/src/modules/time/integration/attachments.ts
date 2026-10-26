import type { z } from 'zod';
import type {
  deleteTaskAttachmentSchema,
  listTaskAttachmentsSchema,
  uploadTaskAttachmentSchema,
} from '@schemas/time';
import { API_ROUTER } from '@/shared/router/routes';
import type { Attachment, TaskId } from '../domain/models';

type Out<T extends () => z.ZodType<{ out: unknown }>> = z.infer<
  ReturnType<T>
>['out'];

export const fetchAttachments = async (id: TaskId): Promise<Attachment[]> => {
  const response = await fetch(API_ROUTER.timeTaskAttachments(id), {
    headers: { Accept: 'application/json' },
  });
  const json = (await response.json()) as Out<typeof listTaskAttachmentsSchema>;
  if (json.code !== 200) throw new Error(json.message);
  return json.data;
};

export const postAttachment = async (
  id: TaskId,
  file: File,
): Promise<Attachment & { originalSize: number }> => {
  const body = new FormData();
  body.set('file', file, file.name);
  const response = await fetch(API_ROUTER.timeTaskAttachments(id), {
    method: 'POST',
    body,
  });
  const json = (await response.json()) as Out<
    typeof uploadTaskAttachmentSchema
  >;
  if (json.code !== 201) throw new Error(json.message);
  return json.data;
};

export const removeAttachment = async (id: string): Promise<void> => {
  const response = await fetch(API_ROUTER.timeAttachmentById(id), {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
  });
  const json = (await response.json()) as Out<
    typeof deleteTaskAttachmentSchema
  >;
  if (json.code !== 200) throw new Error(json.message);
};
