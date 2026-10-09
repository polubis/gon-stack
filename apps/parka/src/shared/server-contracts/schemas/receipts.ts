import z from 'zod';
import {
  detectImageType,
  IMAGE_SIGNATURE_BYTES,
} from '@/shared/image-processing/detect-image-type';
import { errorOut } from './general';

const receiptFile = () =>
  z
    .instanceof(File)
    .refine(
      async (file) =>
        detectImageType(
          new Uint8Array(
            await file.slice(0, IMAGE_SIGNATURE_BYTES).arrayBuffer(),
          ),
        ) !== null,
      'File must be a JPEG, PNG, WebP or GIF image',
    )
    .refine((file) => file.size > 0, 'File is empty')
    .refine((file) => file.size <= RECEIPT_MAX_BYTES, 'File exceeds 10 MB');

const itemCategory = () =>
  z.discriminatedUnion('status', [
    z.object({ status: z.literal('assigned'), categoryId: z.string().min(1) }),
    z.object({
      status: z.literal('unknown'),
      suggestion: z.string().nullable(),
    }),
  ]);

export const RECEIPT_MAX_BYTES = 10 * 1024 * 1024;

export const scanReceiptSchema = () =>
  z.object({
    in: z.object({ file: receiptFile() }),
    out: z.union([
      z.object({
        code: z.literal(200),
        data: z.object({
          merchant: z.string(),
          date: z.string().min(1),
          amount: z.coerce.number(),
          paymentMethod: z.string().nullable(),
          items: z.array(
            z.object({
              name: z.string(),
              unitPrice: z.coerce.number(),
              quantity: z.coerce.number(),
              discount: z.coerce.number(),
              category: itemCategory(),
            }),
          ),
        }),
      }),
      errorOut(),
    ]),
  });
