import { useRef, type ChangeEvent, type ReactNode } from 'react';
import { Camera, Upload } from 'lucide-react';
import { Button } from '@/shared/ui/controls';
import { useContext } from './context';
import { ReceiptScanError, ReceiptScanning } from './scan-feedback';

/**
 * Upload or camera in one click: the picked photo is scanned right away and
 * `children` (the form) is replaced by progress or error while that runs.
 */
export const ReceiptUpload = ({ children }: { children: ReactNode }) => {
  const ctx = useContext();
  const scan = ctx.useScan();
  const uploadRef = useRef<HTMLInputElement>(null);
  const cameraRef = useRef<HTMLInputElement>(null);
  const scanning = scan.status === 'scanning';

  const onPicked = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (file) ctx.scanReceipt(file);
  };

  return (
    <>
      <section
        aria-label="Dodaj z paragonu"
        className="grid grid-cols-2 gap-2 md:max-w-md"
      >
        <Button
          variant="ghost"
          disabled={scanning}
          data-e2e="expenses-management:upload"
          onClick={() => uploadRef.current?.click()}
        >
          <Upload className="h-4 w-4" aria-hidden="true" />
          Wgraj z pliku
        </Button>
        <Button
          variant="ghost"
          disabled={scanning}
          data-e2e="expenses-management:camera"
          onClick={() => cameraRef.current?.click()}
        >
          <Camera className="h-4 w-4" aria-hidden="true" />
          Zrób zdjęcie
        </Button>
        <input
          ref={uploadRef}
          type="file"
          accept="image/*"
          hidden
          aria-label="Plik ze zdjęciem paragonu"
          data-e2e="expenses-management:upload-input"
          onChange={onPicked}
        />
        <input
          ref={cameraRef}
          type="file"
          accept="image/*"
          capture="environment"
          hidden
          aria-label="Zdjęcie paragonu z aparatu"
          data-e2e="expenses-management:camera-input"
          onChange={onPicked}
        />
      </section>

      {scan.status === 'scanning' ? <ReceiptScanning /> : null}
      {scan.status === 'failed' ? (
        <ReceiptScanError
          description={scan.message}
          onRetry={() =>
            scan.file ? ctx.scanReceipt(scan.file) : uploadRef.current?.click()
          }
          onBack={ctx.dismissScan}
        />
      ) : null}
      {scan.status === 'idle' ? children : null}
    </>
  );
};
