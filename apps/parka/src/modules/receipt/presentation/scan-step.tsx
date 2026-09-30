import { Camera, Plus, Sparkles } from 'lucide-react';
import { APP_ROUTER } from '@/shared/router';
import { Button, ScreenHeader } from '@/shared/ui';

type Props = {
  processing: boolean;
  onCapture: () => void;
  onManual: () => void;
};

export const ScanStep = ({ processing, onCapture, onManual }: Props) => (
  <>
    <div className="md:px-4 lg:px-6 xl:px-12">
      <ScreenHeader
        title="Zrób zdjęcie paragonu"
        backHref={APP_ROUTER.dashboard()}
      />
    </div>
    <main className="flex flex-1 flex-col items-center justify-between px-6 pb-10 pt-4 md:px-8 lg:grid lg:grid-cols-2 lg:grid-rows-[1fr_1fr] lg:gap-x-16 lg:px-10 lg:py-8 xl:px-16">
      <p className="text-center text-sm text-ink-soft lg:col-start-2 lg:row-start-1 lg:max-w-xs lg:self-end lg:pb-4 lg:text-left lg:text-base">
        Automatyczne odczytywanie danych. Ustaw paragon w kadrze i zrób zdjęcie.
      </p>
      <div className="my-8 grid aspect-[3/4] w-full max-w-xs place-items-center lg:col-start-1 lg:row-span-2 lg:row-start-1 lg:my-0 lg:max-w-sm lg:justify-self-end rounded-3xl border-2 border-dashed border-brand/40 bg-brand-softer text-brand">
        {processing ? (
          <span
            className="flex flex-col items-center gap-2 text-sm font-medium"
            role="status"
          >
            <Sparkles
              className="h-8 w-8 animate-pulse motion-reduce:animate-none"
              aria-hidden="true"
            />
            Analizuję paragon…
          </span>
        ) : (
          <Camera className="h-12 w-12" aria-hidden="true" />
        )}
      </div>
      <div className="flex w-full max-w-xs flex-col gap-3 lg:col-start-2 lg:row-start-2 lg:self-start">
        <Button
          variant="ghost"
          data-e2e="receipt:manual"
          onClick={onManual}
          disabled={processing}
        >
          <Plus className="h-4 w-4" aria-hidden="true" />
          Wprowadź ręcznie
        </Button>
        <Button
          data-e2e="receipt:capture"
          onClick={onCapture}
          disabled={processing}
        >
          <Camera className="h-4 w-4" aria-hidden="true" />
          {processing ? 'Przetwarzanie…' : 'Zrób zdjęcie'}
        </Button>
      </div>
    </main>
  </>
);
