export const RECEIPT_E2E_IDS = [
  'receipt:main',
  'receipt:manual',
  'receipt:capture',
  'receipt:review',
  'receipt:merchant',
  'receipt:date',
  'receipt:add-item',
  'receipt:total',
  'receipt:save',
] as const;

export type ReceiptE2eDynamicId =
  | `receipt:item-name:${string | number}`
  | `receipt:item-price:${string | number}`
  | `receipt:item-qty:${string | number}`
  | `receipt:item-discount:${string | number}`
  | `receipt:item-category:${string | number}`;

export type ReceiptE2eId =
  (typeof RECEIPT_E2E_IDS)[number] | ReceiptE2eDynamicId;
