import {
  MAX_RECEIPT_BYTES,
  RECEIPT_FILE_ERRORS,
} from '../configuration/constraints';

/** Why a picked file cannot be scanned, `null` when it can. */
export const receiptFileProblem = (file: File): string | null =>
  !file.type.startsWith('image/')
    ? RECEIPT_FILE_ERRORS.notImage
    : file.size > MAX_RECEIPT_BYTES
      ? RECEIPT_FILE_ERRORS.tooLarge
      : null;

/** Size that fits the longest edge into `maxEdge`; never enlarges. */
export const fitWithin = (
  width: number,
  height: number,
  maxEdge: number,
): { width: number; height: number } => {
  const scale = Math.min(1, maxEdge / Math.max(width, height));

  return {
    width: Math.max(1, Math.round(width * scale)),
    height: Math.max(1, Math.round(height * scale)),
  };
};
