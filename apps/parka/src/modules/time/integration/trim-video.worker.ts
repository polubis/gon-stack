import {
  ALL_FORMATS,
  BlobSource,
  BufferTarget,
  Conversion,
  Input,
  MovOutputFormat,
  Mp4OutputFormat,
  Output,
  WebMOutputFormat,
} from 'mediabunny';
import type { TrimRequest, TrimResponse } from './trim-video';

const formatOf = (mime: string) =>
  mime === 'video/webm'
    ? new WebMOutputFormat()
    : mime === 'video/quicktime'
      ? new MovOutputFormat()
      : new Mp4OutputFormat();

const post = (message: TrimResponse, transfer: Transferable[] = []) =>
  self.postMessage(message, { transfer });

self.onmessage = async ({ data }: MessageEvent<TrimRequest>) => {
  try {
    const target = new BufferTarget();
    const conversion = await Conversion.init({
      input: new Input({
        source: new BlobSource(data.file),
        formats: ALL_FORMATS,
      }),
      output: new Output({ format: formatOf(data.file.type), target }),
      trim: { start: data.start, end: data.end },
    });
    if (!conversion.isValid) throw new Error('Unsupported video');
    conversion.onProgress = (progress) => post({ type: 'progress', progress });
    await conversion.execute();
    const buffer = target.buffer;
    if (!buffer) throw new Error('Empty result');
    post({ type: 'done', buffer }, [buffer]);
  } catch (error) {
    post({
      type: 'error',
      message: error instanceof Error ? error.message : 'Trim failed',
    });
  }
};
