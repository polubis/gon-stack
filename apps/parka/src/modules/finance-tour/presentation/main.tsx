import { useEffect, useEffectEvent, useState } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { X } from 'lucide-react';
import { Toast, type ToastNotice } from '@/shared/ui/toast';
import {
  closeModalThen,
  openModal,
  useModalMounted,
  useModalStack,
} from '@/shared/router/modal-stack';
import { Main as Walkthrough } from '@/shared/walkthrough/presentation/main';
import type { WalkthroughOutcome } from '@/shared/walkthrough/domain/models';
import { ERROR_CODES, TOUR_MODAL } from '../configuration/constraints';
import { fetchOutcome, saveOutcome } from '../integration/repository';
import { STEPS } from './steps';

/** `checking` until the server answers; `due` = never finished, show it. */
type Status = 'checking' | 'due' | 'done';

const noop = () => {};

const isTourInUrl = (): boolean =>
  new URLSearchParams(window.location.search)
    .getAll('modal')
    .includes(TOUR_MODAL);

const TourDialog = ({
  onFinish,
}: {
  onFinish: (outcome: WalkthroughOutcome) => void;
}) => {
  useModalMounted(TOUR_MODAL);
  return (
    <Dialog.Root
      open
      onOpenChange={(open) => {
        if (!open) onFinish('skipped');
      }}
    >
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-(--z-modal) bg-overlay" />
        <Dialog.Content
          data-e2e="finance-tour:dialog"
          aria-describedby={undefined}
          // Start on "next": Enter walks the tour, arrows page it.
          onOpenAutoFocus={(event) => {
            const primary = (
              event.currentTarget as HTMLElement
            ).querySelector<HTMLElement>('[data-e2e="walkthrough:primary"]');
            if (!primary) return;
            event.preventDefault();
            primary.focus();
          }}
          className="fixed inset-x-4 bottom-4 z-(--z-modal) mx-auto flex max-h-[calc(100dvh-2rem)] max-w-md animate-view-enter flex-col overflow-y-auto rounded-3xl bg-card p-5 shadow-popover focus:outline-none motion-reduce:animate-none lg:bottom-auto lg:top-1/2 lg:-translate-y-1/2"
        >
          <div className="mb-4 flex items-center justify-between gap-3">
            <Dialog.Title className="text-xs font-semibold tracking-wide text-brand-dark uppercase">
              Przewodnik po finansach
            </Dialog.Title>
            <Dialog.Close
              data-e2e="finance-tour:close"
              aria-label="Wyłącz przewodnik"
              className="grid h-8 w-8 shrink-0 place-items-center rounded-full text-ink-soft hover:bg-hover"
            >
              <X className="h-4 w-4" aria-hidden="true" />
            </Dialog.Close>
          </div>
          <Walkthrough steps={STEPS} onFinish={onFinish} />
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};

/**
 * First-run tour of the finance features. Opens by itself once per account:
 * finishing, skipping or closing it in any way (X, Esc, Back) ends it for
 * good. Any doubt (no answer, error) keeps it closed.
 */
export const Main = () => {
  const [status, setStatus] = useState<Status>('checking');
  const [notice, setNotice] = useState<ToastNotice | null>(null);
  const stack = useModalStack();
  const isOpen = stack.includes(TOUR_MODAL);

  useEffect(() => {
    const controller = new AbortController();
    fetchOutcome(controller.signal)
      .then((outcome) => setStatus(outcome === null ? 'due' : 'done'))
      .catch(() => {
        if (!controller.signal.aborted) setStatus('done');
      });
    return () => controller.abort();
  }, []);

  const persist = (outcome: WalkthroughOutcome) => {
    saveOutcome(outcome).catch((error: unknown) =>
      setNotice({
        tone: 'error',
        title: 'Nie udało się zapisać przewodnika',
        code: ERROR_CODES.save,
        description:
          error instanceof Error ? error.message : 'Spróbuj ponownie.',
        retry: () => persist(outcome),
      }),
    );
  };

  // Optimistic: the tour is gone at once, the save follows.
  const finish = (outcome: WalkthroughOutcome) => {
    setStatus('done');
    persist(outcome);
    closeModalThen(TOUR_MODAL, noop);
  };

  // Back closed it: same as turning it off.
  const onHistoryChange = useEffectEvent(() => {
    if (status === 'due' && !isTourInUrl()) {
      setStatus('done');
      persist('skipped');
    }
  });

  useEffect(() => {
    if (status !== 'due') return;
    openModal(TOUR_MODAL);
    window.addEventListener('popstate', onHistoryChange);
    return () => window.removeEventListener('popstate', onHistoryChange);
  }, [status]);

  // A stale `?modal=tour` of a finished tour must not linger in the URL.
  useEffect(() => {
    if (status === 'done' && isOpen) closeModalThen(TOUR_MODAL, noop);
  }, [status, isOpen]);

  return (
    <>
      {status === 'due' && isOpen ? <TourDialog onFinish={finish} /> : null}
      {notice ? (
        <Toast
          data-e2e="finance-tour:toast"
          notice={notice}
          onClose={() => setNotice(null)}
        />
      ) : null}
    </>
  );
};
