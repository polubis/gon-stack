# 0032 - Real receipt scanning with AI, quota and hardened server errors

```json
{
  "status": "done"
}
```

Replaced the stubbed `scanReceipt` procedure (sample draft) with a real flow: photo -> quota claim -> vision model -> validated draft.

Server:

- `shared/receipt-reader.ts`: OpenAI-compatible `responses.parse` (env `PARKA_AI_API_KEY`, `PARKA_AI_BASE_URL`, `PARKA_AI_MODEL`), structured output via Zod, 45s timeout, no retries, request abort signal forwarded. Output re-validated with strict limits; text stripped of control/bidi chars; bad date falls back to now.
- `procedures/scan-receipt/to-receipt-draft.ts`: model category matched (case-insensitive) to user's categories -> `assigned`, else `unknown` + suggestion.
- Contract: file type checked by magic bytes (`detect-image-type`), not `file.type`; item `category` is a discriminated union; `paymentMethod` nullable. `server/domain/receipt-scan.ts` (sample) removed.
- Quota: table `receipt_scans` + `claim_receipt_scan()` (20 / rolling 24h, advisory lock per user). Second migration replaces the first: `security invoker`, no client-supplied limit, RLS select/insert own only.
- Errors: all `APIError`s take `cause`; new `TooManyRequests` (429); `fromSupabaseError` maps auth codes in one place; procedure logs 5xx as error, others as warn. `login`/`register` outputs reuse `errorOut()`.
- Adapter: body read lazily (after auth) and only JSON / multipart; malformed body -> 400, empty body -> `{}` (DELETE with JSON content-type). Form-urlencoded and raw text bodies dropped.

Client (`expenses-management`):

- `shrinkReceipt`: photo downscaled to 1600px edge and re-encoded as JPEG q0.8 before upload (also drops EXIF/GPS); falls back to original on any failure.
- 429 -> `ReceiptScanLimitError` -> dedicated Polish message.
- E2E `a scanned receipt fills every field and product of the form` added; unit tests for reader, draft mapping, contract, shrink math.

Decisions:

- OpenAI-compatible client with configurable base URL, not a vendor SDK: provider/model swap is env-only.
- Quota in Postgres, counted before the model call: failed/aborted scans still consume quota, so cost abuse is capped. 20/day hardcoded in SQL; changing it needs a migration.
- First migration (`security definer`, limit as argument) superseded by the invoker version: definer + client-controlled limit let a caller pass any number. Both kept, as the first may already be applied.
- Quota table inaccessible for update/delete by users so attempts cannot be erased to reset the limit.
- Model output is untrusted: prompt says image is data, and code validates/clamps everything instead of trusting the schema.
- Magic-byte check instead of MIME: `file.type` is client-controlled.
- Error `cause` always kept, client gets only the fixed message: no leaks, no account enumeration (`user_already_exists` -> generic text).
- Body read after auth: unauthenticated requests never get parsed/uploaded bodies.
- Client-side shrink is optimisation only (cheaper tokens, smaller upload, strips EXIF); server still enforces 10 MB and type.
- Known gap: no IP/global rate limit; `detail: 'auto'` image cost not capped beyond the 1600px shrink.
- Not committed: 10 `exec-*.png` e2e run artifacts in `src/__e2e__/__data__/` (~22 MB, left untracked).

Reason: item 1 of `IMPROVEMENTS.md` (scanning was a stub); real scanning is paid per call, so it needed a per-user quota, input hardening and safe error handling before shipping.
