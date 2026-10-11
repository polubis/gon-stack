# 0051 - Expense popup: product rows simplified

```json
{
  "status": "done"
}
```

- Decision: product row = category icon + name + total. Nothing else.
- Icon slightly smaller (`h-7 w-7`, was `h-8 w-8`).
- Dropped the category name under the product name (mixed-category expenses) and the `qty x unit price` subtitle.
- Supersedes the subtitle rules from 0050. Tests updated: icon present, no category name.
