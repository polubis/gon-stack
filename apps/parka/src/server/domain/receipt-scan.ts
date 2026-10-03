/** Placeholder until real recognition lands: the same draft for any image. */
export const sampleReceiptDraft = (now: Date) => ({
  merchant: 'Biedronka',
  date: now.toISOString(),
  amount: 42.5,
  paymentMethod: 'Karta',
  items: [
    { name: 'Chleb', unitPrice: 5.5, quantity: 1, discount: 0 },
    { name: 'Mleko', unitPrice: 4, quantity: 2, discount: 0 },
    { name: 'Ser', unitPrice: 29, quantity: 1, discount: 0 },
  ],
});
