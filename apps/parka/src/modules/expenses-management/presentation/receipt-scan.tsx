import type { ReactNode } from 'react';
import { useContext } from './context';
import { ReceiptScanError, ReceiptScanning } from './scan-feedback';

/**
 * A photo picked elsewhere (the "Dodaj" menu) is scanned on arrival:
 * `children` (the form) is replaced by progress or error while that runs.
 */
export const ReceiptScan = ({ children }: { children: ReactNode }) => {
  const ctx = useContext();
  const scan = ctx.useScan();

  return (
    <>
      {scan.status === 'scanning' ? <ReceiptScanning /> : null}
      {scan.status === 'failed' ? (
        <ReceiptScanError
          description={scan.message}
          onRetry={() =>
            scan.file ? ctx.scanReceipt(scan.file) : ctx.dismissScan()
          }
          onBack={ctx.dismissScan}
        />
      ) : null}
      {scan.status === 'idle' ? children : null}
    </>
  );
};
