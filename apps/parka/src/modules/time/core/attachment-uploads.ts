import type { Attachment, TaskId } from '../domain/models';

export type Upload = {
  key: number;
  taskId: TaskId;
  name: string;
  /** 0..1 of the bytes sent. */
  progress: number;
};

type Sender = (
  taskId: TaskId,
  file: File,
  onProgress: (progress: number) => void,
) => Promise<Attachment & { originalSize: number }>;

type Hooks = {
  onDone: (added: Attachment & { originalSize: number }) => void;
  onFail: (error: unknown, retry: () => void) => void;
};

let uploads: readonly Upload[] = [];
let counter = 0;
const listeners = new Set<() => void>();

const set = (next: readonly Upload[]) => {
  uploads = next;
  listeners.forEach((listener) => listener());
};

const patch = (key: number, change: Partial<Upload>) =>
  set(uploads.map((u) => (u.key === key ? { ...u, ...change } : u)));

export const subscribeUploads = (listener: () => void) => {
  listeners.add(listener);
  return () => void listeners.delete(listener);
};

export const readUploads = (): readonly Upload[] => uploads;

/**
 * Sends a file in the background, outside any component: closing the task
 * popup does not stop it. The row shows progress while it runs.
 */
export const startUpload = (
  send: Sender,
  taskId: TaskId,
  file: File,
  hooks: Hooks,
): void => {
  const key = ++counter;
  set([...uploads, { key, taskId, name: file.name, progress: 0 }]);
  send(taskId, file, (progress) => patch(key, { progress })).then(
    (added) => {
      set(uploads.filter((u) => u.key !== key));
      hooks.onDone(added);
    },
    (error: unknown) => {
      set(uploads.filter((u) => u.key !== key));
      hooks.onFail(error, () => startUpload(send, taskId, file, hooks));
    },
  );
};
