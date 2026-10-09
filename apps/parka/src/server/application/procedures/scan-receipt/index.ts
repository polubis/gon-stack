import { scanReceiptSchema } from '@schemas/receipts';
import { withZodSchema } from '../../adapter/zod';
import { readReceipt } from '../../shared/receipt-reader';
import { InternalServer, TooManyRequests } from '../../core/error-handling';
import { privateProcedure } from '../../core/procedure';
import { toReceiptDraft } from './to-receipt-draft';

export const scanReceipt = privateProcedure({
  schema: withZodSchema({ schema: scanReceiptSchema }),
})({
  handler: async ({ file }, { db, signal }) => {
    const claim = await db.rpc('claim_receipt_scan');
    if (claim.error) throw new InternalServer(claim.error);
    if (!claim.data) {
      throw new TooManyRequests(undefined, 'Daily receipt scan limit reached');
    }

    const { data: categories, error } = await db
      .from('categories')
      .select('id, name');
    if (error) throw new InternalServer(error);

    const extracted = await readReceipt({
      file,
      categoryNames: categories.map((c) => c.name),
      signal,
    });

    return {
      code: 200 as const,
      data: toReceiptDraft(extracted, categories),
    };
  },
});
