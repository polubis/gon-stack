-- Task attachments grow to 20 MB and take videos, archives and office files.
-- Photos stay capped at 5 MB by the API (they are re-encoded before storing).

update storage.buckets
set
  file_size_limit = 20971520,
  allowed_mime_types = array[
    'image/png', 'image/jpeg', 'image/webp', 'image/gif',
    'application/pdf', 'text/plain', 'text/csv', 'text/markdown',
    'application/json', 'application/zip',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'video/mp4', 'video/webm', 'video/quicktime'
  ]
where id = 'task-attachments';

alter table public.time_task_attachments
  drop constraint time_task_attachments_size_check,
  add constraint time_task_attachments_size_check
    check (size between 1 and 20971520);
