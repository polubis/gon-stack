import { catchError, EMPTY, finalize, from, map, switchMap, tap } from 'rxjs';
import type { Store } from '../store';
import type { Bus } from '../bus';
import { RECEIPT_FILE_ERRORS } from '../../configuration/constraints';
import { receiptFileProblem } from '../../domain/receipt-file';
import { postReceiptScan } from '../../integration/repository';

/** A newer photo replaces the one still being read. */
export const scanReceipt = (store: Store, { ofType }: Bus) =>
  ofType('[TRIGGER]_SCAN_RECEIPT').pipe(
    map(({ file }) => ({ file, problem: receiptFileProblem(file) })),
    switchMap(({ file, problem }) => {
      if (problem) {
        store.$scan.set({ status: 'failed', message: problem, file: null });
        return EMPTY;
      }

      const ctrl = new AbortController();
      store.$scan.set({ status: 'scanning' });

      return from(postReceiptScan(file, ctrl.signal)).pipe(
        tap((draft) => {
          store.$scanned.set({
            id: (store.$scanned.get()?.id ?? 0) + 1,
            draft,
          });
          store.$scan.reset();
        }),
        catchError((error) => {
          const isAbort =
            error instanceof DOMException && error.name === 'AbortError';

          if (!isAbort) {
            store.$scan.set({
              status: 'failed',
              message: RECEIPT_FILE_ERRORS.scan,
              file,
            });
          }

          return EMPTY;
        }),
        finalize(() => ctrl.abort()),
      );
    }),
  );
