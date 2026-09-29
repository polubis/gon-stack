import { useEffect, useState } from 'react';
import { ErrorBoundary } from '@repo/react-kit/error-boundary';
import { APP_ROUTER, navigateTo } from '@/shared/router';
import { ErrorState, LoadingBanner, Toast } from '@/shared/ui';
import {
  CAPTURE_DELAY_MS,
  DEFAULT_ITEM_NAME,
  ERROR_CODES,
  NO_CATEGORY,
  NOTIFICATION_TITLE,
  PAYMENT_METHOD,
} from '../configuration/constraints';
import { money } from '../domain/format';
import type { Draft } from '../domain/models';
import { emptyDraft, toReceipt } from '../domain/receipt';
import { defaultCategoryId, draftTotal } from './selectors';
import { Provider, useContext } from './context';
import { ReviewStep } from './review-step';
import { ScanSkeleton } from './scan-skeleton';
import { ScanStep } from './scan-step';

type Step =
  { type: 'scan' } | { type: 'processing' } | { type: 'review'; draft: Draft };

const buildReceipt = (draft: Draft) => {
  const amount = draftTotal(draft);
  return toReceipt(draft, {
    amount,
    notificationTitle: NOTIFICATION_TITLE,
    notificationBody: `${draft.merchant} · ${money(amount)}`,
    paymentMethod: PAYMENT_METHOD,
    fallbackCategoryId: NO_CATEGORY,
  });
};

const ReceiptView = () => {
  const ctx = useContext();
  const categories = ctx.useCategories();
  const error = ctx.useError();
  const notice = ctx.useNotice();
  const initializing = ctx.useInitializing();
  const isLoading = ctx.useIsLoading();
  const saving = ctx.useSaving();
  const saved = ctx.useSaved();
  const [step, setStep] = useState<Step>({ type: 'scan' });
  const processing = step.type === 'processing';

  useEffect(() => {
    ctx.load();
  }, [ctx]);

  useEffect(() => {
    if (saved) navigateTo(APP_ROUTER.expenses());
  }, [saved]);

  useEffect(() => {
    if (!processing) return;
    const timer = window.setTimeout(
      () =>
        setStep({
          type: 'review',
          draft: emptyDraft(defaultCategoryId(categories), DEFAULT_ITEM_NAME),
        }),
      CAPTURE_DELAY_MS,
    );
    return () => window.clearTimeout(timer);
  }, [processing, categories]);

  const startManual = () =>
    setStep({
      type: 'review',
      draft: emptyDraft(defaultCategoryId(categories), DEFAULT_ITEM_NAME),
    });

  return (
    <div data-e2e="receipt:main" className="relative flex flex-1 flex-col">
      <LoadingBanner active={isLoading && !initializing} />
      {error ? (
        <div className="px-4 pt-4">
          <ErrorState
            data-e2e="receipt:load-error"
            title="Nie udało się wczytać kategorii"
            code={ERROR_CODES.load}
            description={error}
            onRetry={ctx.load}
            backHref={APP_ROUTER.dashboard()}
          />
        </div>
      ) : null}

      {initializing ? (
        <ScanSkeleton />
      ) : step.type === 'review' ? (
        <ReviewStep
          draft={step.draft}
          categories={categories}
          saving={saving}
          onChange={(draft) => setStep({ type: 'review', draft })}
          onSave={() => ctx.save(buildReceipt(step.draft))}
        />
      ) : (
        <ScanStep
          processing={processing}
          onCapture={() => setStep({ type: 'processing' })}
          onManual={startManual}
        />
      )}

      {notice ? (
        <Toast
          key={notice.id}
          data-e2e="receipt:toast"
          tone={notice.tone}
          message={notice.message}
          onDismiss={ctx.dismissNotice}
        />
      ) : null}
    </div>
  );
};

export const Main = () => (
  <ErrorBoundary
    fallback={({ reset }) => (
      <ErrorState
        title="Wystąpił błąd widoku paragonu"
        code={ERROR_CODES.render}
        description="Nie udało się wyświetlić formularza. Spróbuj ponownie."
        onRetry={reset}
        backHref={APP_ROUTER.dashboard()}
      />
    )}
  >
    <Provider>
      <ReceiptView />
    </Provider>
  </ErrorBoundary>
);
