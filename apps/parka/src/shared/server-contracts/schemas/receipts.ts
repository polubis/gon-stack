import z from 'zod';
import { errorOut } from './general';

const receiptFile = () =>
  z
    .instanceof(File)
    .refine((file) => file.type.startsWith('image/'), 'File must be an image')
    .refine((file) => file.size > 0, 'File is empty')
    .refine((file) => file.size <= RECEIPT_MAX_BYTES, 'File exceeds 10 MB');

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
          paymentMethod: z.string(),
          items: z.array(
            z.object({
              name: z.string(),
              unitPrice: z.coerce.number(),
              quantity: z.coerce.number(),
              discount: z.coerce.number(),
            }),
          ),
        }),
      }),
      errorOut(),
    ]),
  });
