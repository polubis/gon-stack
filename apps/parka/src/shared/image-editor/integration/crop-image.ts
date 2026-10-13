import {
  cropRect,
  outputSide,
  rotatedSize,
  type Center,
  type Rotation,
  type Size,
} from '../domain/crop';
import { OUTPUT_MAX_SIZE } from '../configuration/constraints';

export type Edit = { rotation: Rotation; zoom: number; center: Center };

export type Decoded = { bitmap: ImageBitmap; size: Size };

/** Decodes the file (EXIF orientation applied). Rejects when it is no image. */
export const decodeImage = async (file: File): Promise<Decoded> => {
  const bitmap = await createImageBitmap(file);
  return { bitmap, size: { width: bitmap.width, height: bitmap.height } };
};

/** Paints the edited square into `canvas`, whatever its backing size. */
export const paintCrop = (
  canvas: HTMLCanvasElement,
  { bitmap, size }: Decoded,
  { rotation, zoom, center }: Edit,
) => {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  const rect = cropRect(size, rotation, zoom, center);
  const rotated = rotatedSize(size, rotation);
  const k = canvas.width / rect.side;

  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.imageSmoothingQuality = 'high';
  ctx.scale(k, k);
  ctx.translate(-rect.x, -rect.y);
  // Put the rotated image back at the origin, then draw the original on it.
  if (rotation === 90) ctx.translate(rotated.width, 0);
  if (rotation === 180) ctx.translate(rotated.width, rotated.height);
  if (rotation === 270) ctx.translate(0, rotated.height);
  ctx.rotate((rotation * Math.PI) / 180);
  ctx.drawImage(bitmap, 0, 0);
};

/** The edited square as a new PNG file named after the original. */
export const exportCrop = async (
  file: File,
  decoded: Decoded,
  edit: Edit,
): Promise<File> => {
  const { side } = cropRect(
    decoded.size,
    edit.rotation,
    edit.zoom,
    edit.center,
  );
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = outputSide(side, OUTPUT_MAX_SIZE);
  paintCrop(canvas, decoded, edit);
  const blob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob(resolve, 'image/png'),
  );
  if (!blob) throw new Error('Could not export the edited image');
  return new File([blob], file.name.replace(/\.[^.]+$/, '') + '.png', {
    type: 'image/png',
  });
};
