import {
  ALL_FORMATS,
  BlobSource,
  BufferTarget,
  Conversion,
  Input,
  Mp4OutputFormat,
  Output,
  WebMOutputFormat,
} from 'mediabunny';

export type TrimRequest = { file: File; start: number; end: number };

export type TrimMessage =
  | { type: 'progress'; value: number }
  | { type: 'done'; bytes: ArrayBuffer; mime: string }
  | { type: 'error' };

/** Cuts `[start, end]` out of a video off the main thread. */
self.onmessage = async ({ data }: MessageEvent<TrimRequest>) => {
  const post = (message: TrimMessage, transfer: Transferable[] = []) =>
    self.postMessage(message, { transfer });
  try {
    const webm = data.file.type === 'video/webm';
    const target = new BufferTarget();
    const output = new Output({
      format: webm ? new WebMOutputFormat() : new Mp4OutputFormat(),
      target,
    });
    const conversion = await Conversion.init({
      input: new Input({
        source: new BlobSource(data.file),
        formats: ALL_FORMATS,
      }),
      output,
      trim: { start: data.start, end: data.end },
    });
    if (!conversion.isValid) throw new Error('Unsupported video');
    conversion.onProgress = (value) => post({ type: 'progress', value });
    await conversion.execute();
    const bytes = target.buffer!;
    post({ type: 'done', bytes, mime: webm ? 'video/webm' : 'video/mp4' }, [
      bytes,
    ]);
  } catch {
    post({ type: 'error' });
  }
};
