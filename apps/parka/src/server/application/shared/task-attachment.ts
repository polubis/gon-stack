import type { Database } from '@/shared/data-sources/db-schema';

type Row = Database['public']['Tables']['time_task_attachments']['Row'];

export const TASK_ATTACHMENT_BUCKET = 'task-attachments';

/** A video still `uploading` after this long lost its background save. */
export const UPLOAD_STALE_MS = 5 * 60 * 1000;

export const taskAttachmentPath = (userId: string, id: string) =>
  `${userId}/${id}`;

export const toTaskAttachment = (row: Row) => ({
  id: row.id,
  name: row.name,
  size: row.size,
  mime: row.mime,
  status: row.status as 'uploading' | 'ready' | 'failed',
});
