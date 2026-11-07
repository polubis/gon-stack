export type TrimRequest = { file: File; start: number; end: number };

export type TrimResponse =
  | { type: 'progress'; progress: number }
  | { type: 'done'; buffer: ArrayBuffer }
  | { type: 'error'; message: string };

/**
 * Cuts `file` to `[start, end]` seconds in a dedicated web worker, so the page
 * stays responsive. Resolves with a new file of the same name and type.
 */
export const trimVideo = (
  request: TrimRequest,
  onProgress: (progress: number) => void,
): Promise<File> =>
  new Promise((resolve, reject) => {
    const worker = new Worker(
      new URL('./trim-video.worker.ts', import.meta.url),
      { type: 'module' },
    );
    const finish = () => worker.terminate();
    worker.onmessage = ({ data }: MessageEvent<TrimResponse>) => {
      if (data.type === 'progress') return onProgress(data.progress);
      finish();
      if (data.type === 'error') return reject(new Error(data.message));
      resolve(
        new File([data.buffer], request.file.name, { type: request.file.type }),
      );
    };
    worker.onerror = () => {
      finish();
      reject(new Error('Trim failed'));
    };
    worker.postMessage(request);
  });
