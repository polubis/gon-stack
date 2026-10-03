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
