import type { TrimMessage, TrimRequest } from './trim-video.worker';

const renamed = (name: string, mime: string): string =>
  `${name.replace(/\.[^./\\]+$/, '')}.${mime === 'video/webm' ? 'webm' : 'mp4'}`;

/** Length of a video in seconds; rejects when the browser cannot read it. */
export const readDuration = (url: string): Promise<number> =>
  new Promise((resolve, reject) => {
    const video = document.createElement('video');
    video.preload = 'metadata';
    video.onloadedmetadata = () => resolve(video.duration);
    video.onerror = () => reject(new Error('Unreadable video'));
    video.src = url;
  });

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
