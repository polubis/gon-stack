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

/** Sends one file; `onProgress` gets 0..1 while the bytes go out. */
export const postAttachment = (
  id: TaskId,
  file: File,
  onProgress: (progress: number) => void = () => undefined,
): Promise<Attachment & { originalSize: number }> =>
  new Promise((resolve, reject) => {
    const body = new FormData();
    body.set('file', file, file.name);
    const request = new XMLHttpRequest();
    request.open('POST', API_ROUTER.timeTaskAttachments(id));
    request.setRequestHeader('Accept', 'application/json');
    request.responseType = 'json';
    request.upload.onprogress = (event) => {
      if (event.lengthComputable) onProgress(event.loaded / event.total);
    };
    request.onerror = () => reject(new Error('Network error'));
    request.onload = () => {
      const json = request.response as Out<
        typeof uploadTaskAttachmentSchema
      > | null;
      if (json?.code === 201) return resolve(json.data);
      reject(new Error(json?.message ?? `HTTP ${request.status}`));
    };
    request.send(body);
  });

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
