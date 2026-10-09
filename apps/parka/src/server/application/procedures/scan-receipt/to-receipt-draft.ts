type ReceiptCategory = { id: string; name: string };

type ItemCategory =
  | { status: 'assigned'; categoryId: string }
  | { status: 'unknown'; suggestion: string | null };

type ExtractedItem = {
  name: string;
  unitPrice: number;
  quantity: number;
  discount: number;
  category: string | null;
  suggestedCategory: string | null;
};

type Extracted = {
  merchant: string;
  date: string;
  amount: number;
  paymentMethod: string | null;
  items: ExtractedItem[];
};

const normalize = (value: string) => value.trim().toLocaleLowerCase();

const resolveCategory = (
  { category, suggestedCategory }: ExtractedItem,
  categories: ReceiptCategory[],
): ItemCategory => {
  const match =
    category === null
      ? undefined
      : categories.find((c) => normalize(c.name) === normalize(category));

  if (match) return { status: 'assigned', categoryId: match.id };

  return {
    status: 'unknown',
    suggestion: suggestedCategory?.trim() || category?.trim() || null,
  };
};

/** Items keep the recognised category when it is one of the user's, else `unknown`. */
export const toReceiptDraft = (
  extracted: Extracted,
  categories: ReceiptCategory[],
) => ({
  merchant: extracted.merchant,
  date: extracted.date,
  amount: extracted.amount,
  paymentMethod: extracted.paymentMethod,
  items: extracted.items.map((item) => ({
    name: item.name,
    unitPrice: item.unitPrice,
    quantity: item.quantity,
    discount: item.discount,
    category: resolveCategory(item, categories),
  })),
});
