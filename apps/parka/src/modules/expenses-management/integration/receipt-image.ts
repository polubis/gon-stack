import { RECEIPT_UPLOAD } from '../configuration/constraints';
import { fitWithin } from '../domain/receipt-file';

/**
 * Downscales and re-encodes a photo as JPEG (also drops EXIF such as GPS).
 * Optimisation only: returns the original file when anything fails.
 */
export const shrinkReceipt = async (file: File): Promise<File> => {
  try {
    const bitmap = await createImageBitmap(file, {
      imageOrientation: 'from-image',
    });
    const { width, height } = fitWithin(
      bitmap.width,
      bitmap.height,
      RECEIPT_UPLOAD.maxEdge,
    );
    const canvas = new OffscreenCanvas(width, height);
    canvas.getContext('2d')?.drawImage(bitmap, 0, 0, width, height);
    bitmap.close();

    const blob = await canvas.convertToBlob({
      type: 'image/jpeg',
      quality: RECEIPT_UPLOAD.quality,
    });

    return blob.size < file.size
      ? new File([blob], 'receipt.jpg', { type: blob.type })
      : file;
  } catch {
    return file;
  }
};
