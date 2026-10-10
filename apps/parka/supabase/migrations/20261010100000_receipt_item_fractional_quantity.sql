-- Receipts sell by weight (0.289 kg), so quantity must hold fractions.
alter table public.receipt_items
  alter column quantity type numeric(12, 3) using quantity::numeric(12, 3),
  alter column quantity set default 1;
