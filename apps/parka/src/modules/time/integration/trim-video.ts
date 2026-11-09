import { ALL_FORMATS, BlobSource, Input } from 'mediabunny';
import type { TrimMessage, TrimRequest } from './trim-video.worker';

const renamed = (name: string, mime: string): string =>
  `${name.replace(/\.[^./\\]+$/, '')}.${mime === 'video/webm' ? 'webm' : 'mp4'}`;

/** Length of a video in seconds, read from its container; rejects when unreadable. */
export const readDuration = async (file: File): Promise<number> => {
  const input = new Input({
    source: new BlobSource(file),
    formats: ALL_FORMATS,
  });
  try {
    return (
      (await input.getDurationFromMetadata()) ?? (await input.computeDuration())
    );
  } finally {
    input.dispose();
  }
};

/** Object URL for a picked file, `null` when the browser hands back anything else. */
export const previewUrl = (file: File): string | null => {
  const url = URL.createObjectURL(file);
  if (new URL(url).protocol === 'blob:') return url;
  URL.revokeObjectURL(url);
  return null;
};

/** Cuts a video to `[start, end]` seconds on its own web worker. */
export const trimVideo = (
  file: File,
  start: number,
  end: number,
  onProgress: (value: number) => void,
): Promise<File> =>
  new Promise((resolve, reject) => {
    const worker = new Worker(
      new URL('./trim-video.worker.ts', import.meta.url),
      { type: 'module' },
    );
    worker.onmessage = ({ data }: MessageEvent<TrimMessage>) => {
      if (data.type === 'progress') return onProgress(data.value);
      worker.terminate();
      if (data.type === 'error') return reject(new Error('Trim failed'));
      resolve(
        new File([data.bytes], renamed(file.name, data.mime), {
          type: data.mime,
        }),
      );
    };
    worker.onerror = () => {
      worker.terminate();
      reject(new Error('Trim failed'));
    };
    worker.postMessage({ file, start, end } satisfies TrimRequest);
  });
