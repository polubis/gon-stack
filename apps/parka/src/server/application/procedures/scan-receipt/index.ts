import { scanReceiptSchema } from '@schemas/receipts';
import { withZodSchema } from '../../adapter/zod';
import { privateProcedure } from '../../core/procedure';
import { sampleReceiptDraft } from '@/server/domain/receipt-scan';

export const scanReceipt = privateProcedure({
  schema: withZodSchema({ schema: scanReceiptSchema }),
})({
  handler: async () => ({
    code: 200 as const,
    data: sampleReceiptDraft(new Date()),
  }),
});
