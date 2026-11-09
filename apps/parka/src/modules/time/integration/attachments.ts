import type { z } from 'zod';
import { attachmentEventSchema } from '@schemas/time';
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

export type AttachmentEvent = z.infer<typeof attachmentEventSchema>;

export const fetchAttachments = async (id: TaskId): Promise<Attachment[]> => {
  const response = await fetch(API_ROUTER.timeTaskAttachments(id), {
    headers: { Accept: 'application/json' },
  });
  const json = (await response.json()) as Out<typeof listTaskAttachmentsSchema>;
  if (json.code !== 200) throw new Error(json.message);
  return json.data;
};

/** Sends a file; `onProgress` gets 0-100 while the bytes travel, `signal` cancels it. */
export const postAttachment = (
  id: TaskId,
  file: File,
  onProgress: (percent: number) => void = () => {},
  signal?: AbortSignal,
): Promise<Attachment & { originalSize: number }> =>
  new Promise((resolve, reject) => {
    const body = new FormData();
    body.set('file', file, file.name);
    const request = new XMLHttpRequest();
    request.open('POST', API_ROUTER.timeTaskAttachments(id));
    request.responseType = 'json';
    request.upload.onprogress = (event) =>
      event.lengthComputable &&
      onProgress(Math.round((event.loaded / event.total) * 100));
    request.onerror = () => reject(new Error('Network error'));
    signal?.addEventListener(
      'abort',
      () => {
        request.abort();
        reject(new DOMException('Aborted', 'AbortError'));
      },
      { once: true },
    );
    request.onload = () => {
      const json = request.response as Out<typeof uploadTaskAttachmentSchema>;
      if (json?.code === 201) resolve(json.data);
      else reject(new Error(json?.message ?? 'Upload failed'));
    };
    request.send(body);
  });

/** Live changes of the user's attachments; returns the unsubscribe function. */
export const watchAttachments = (
  onEvent: (event: AttachmentEvent) => void,
  /** Runs on every (re)connect: events missed while offline are gone. */
  onOpen: () => void,
): (() => void) => {
  if (typeof EventSource === 'undefined') return () => {};
  const source = new EventSource(API_ROUTER.timeAttachmentEvents());
  source.onopen = onOpen;
  source.onmessage = ({ data }) => {
    const parsed = attachmentEventSchema.safeParse(JSON.parse(data));
    if (parsed.success) onEvent(parsed.data);
  };
  return () => source.close();
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
