import type {
  CategoryId,
  Draft,
  ExpenseId,
  NewReceipt,
  NotificationId,
  ReceiptItem,
  ReceiptItemId,
} from './models';

const randomId = (prefix: string): string => `${prefix}-${crypto.randomUUID()}`;

export const createItem = (
  categoryId: CategoryId,
  name: string,
): ReceiptItem => ({
  id: randomId('ri') as ReceiptItemId,
  name,
  unitPrice: 0,
  quantity: 1,
  discount: 0,
  categoryId,
});

export const emptyDraft = (
  categoryId: CategoryId,
  itemName: string,
): Draft => ({
  merchant: '',
  date: new Date().toISOString().slice(0, 10),
  items: [createItem(categoryId, itemName)],
});

export const addItem = (
  draft: Draft,
  categoryId: CategoryId,
  itemName: string,
): Draft => ({
  ...draft,
  items: [...draft.items, createItem(categoryId, itemName)],
});

export const patchItem = (
  draft: Draft,
  id: ReceiptItemId,
  patch: Partial<Omit<ReceiptItem, 'id'>>,
): Draft => ({
  ...draft,
  items: draft.items.map((i) => (i.id === id ? { ...i, ...patch } : i)),
});

/** Expense + its confirmation notification, both with fresh client ids. */
export const toReceipt = (
  draft: Draft,
  meta: {
    amount: number;
    notificationTitle: string;
    notificationBody: string;
    paymentMethod: string;
    fallbackCategoryId: CategoryId;
  },
): NewReceipt => ({
  expense: {
    id: randomId('exp') as ExpenseId,
    merchant: draft.merchant,
    date: `${draft.date}T12:00:00`,
    amount: meta.amount,
    categoryId: draft.items[0]?.categoryId ?? meta.fallbackCategoryId,
    paymentMethod: meta.paymentMethod,
    isBill: false,
    source: 'receipt',
    items: draft.items,
  },
  notification: {
    id: randomId('ntf') as NotificationId,
    kind: 'receipt-confirmation',
    title: meta.notificationTitle,
    body: meta.notificationBody,
    ageDays: 0,
  },
});
