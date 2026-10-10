# 0045 - parka product starts empty, name required

```json
{
  "status": "done"
}
```

Parka expenses-management: new product no longer gets default "Nowy produkt" (`DEFAULT_PRODUCT_NAME` removed). Save blocked when any product has no name: card opens, field focused, `aria-invalid` + hint "Podaj nazwę produktu.". Collapsed card shows "Bez nazwy" fallback. Unit + e2e tests name their products; new e2e `i cannot save a product without a name`. Proof video sent in chat.

Reason: user had to delete the prefilled name every time; validation stays, preset value goes.
