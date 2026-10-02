import { useEffect, useState } from 'react';
import { ErrorBoundary } from '@repo/react-kit/error-boundary';
import { APP_ROUTER } from '@/shared/router/routes';
import { Card, ScreenHeader } from '@/shared/ui/layout';
import { CategoryAvatar } from '@/shared/ui/category-chip';
import { ErrorState } from '@/shared/ui/error-state';
import { LoadingBanner } from '@/shared/ui/loading-banner';
import { Segmented, Toggle } from '@/shared/ui/controls';
import { Toast } from '@/shared/ui/toast';
import { ERROR_CODES, TAB_OPTIONS } from '../configuration/constraints';
import { dateLabel, money } from '../domain/format';
import type { RecurringId, Tab } from '../domain/models';
import { filterByTab, resolveCategory } from './selectors';
import { Provider, useContext } from './context';
import { ListSkeleton } from './list-skeleton';
import { RecurringDetail } from './recurring-detail';

const RecurringView = () => {
  const ctx = useContext();
  const recurring = ctx.useRecurring();
  const categories = ctx.useCategories();
  const error = ctx.useError();
  const notice = ctx.useNotice();
  const initializing = ctx.useInitializing();
  const isLoading = ctx.useIsLoading();
  const [tab, setTab] = useState<Tab>('active');
  const [openId, setOpenId] = useState<RecurringId | null>(null);

  useEffect(() => {
    ctx.load();
  }, [ctx]);

  const list = filterByTab(recurring, tab);

  return (
    <div data-e2e="recurring:main" className="relative flex flex-1 flex-col">
      <LoadingBanner active={isLoading && !initializing} />
      <div className="md:px-4 lg:px-6 xl:px-12">
        <ScreenHeader
          title="Wydatki cykliczne"
          backHref={APP_ROUTER.settings()}
        />
      </div>
      <main className="flex flex-1 flex-col gap-4 px-4 pb-6 pt-2 md:gap-6 md:px-8 lg:px-10 xl:px-16">
        {error ? (
          <ErrorState
            data-e2e="recurring:load-error"
            title="Nie udało się wczytać wydatków cyklicznych"
            code={ERROR_CODES.load}
            description={error}
            onRetry={ctx.load}
            backHref={APP_ROUTER.settings()}
          />
        ) : null}

        <div className="md:max-w-sm">
          <Segmented<Tab>
            label="Filtr wydatków cyklicznych"
            value={tab}
            onChange={setTab}
            options={TAB_OPTIONS}
          />
        </div>

        {initializing ? (
          <ListSkeleton />
        ) : (
          <ul
            className="space-y-2 md:grid md:grid-cols-2 md:items-start md:gap-4 md:space-y-0 xl:grid-cols-3"
            data-e2e="recurring:list"
          >
            {list.map((r) => {
              const category = resolveCategory(categories, r.categoryId);
              const open = openId === r.id;
              return (
                <Card as="li" key={r.id} className="space-y-3">
                  <div className="flex items-center gap-3">
                    <CategoryAvatar category={category} />
                    <button
                      type="button"
                      className="flex-1 text-left"
                      aria-expanded={open}
                      data-e2e={`recurring:row:${r.id}`}
                      onClick={() => setOpenId(open ? null : r.id)}
                    >
                      <span className="block text-sm font-medium">
                        {r.name}
                      </span>
                      <span className="block text-xs text-ink-soft">
                        Co miesiąc · {money(r.cost)} · następny{' '}
                        {dateLabel(r.nextPaymentDate)}
                      </span>
                    </button>
                    <Toggle
                      checked={r.active}
                      onChange={(active) => ctx.update({ ...r, active })}
                      label={`Śledzenie: ${r.name}`}
                    />
                  </div>

                  {open ? <RecurringDetail recurring={r} /> : null}
                </Card>
              );
            })}
            {list.length === 0 && !error ? (
              <li className="text-sm text-ink-soft md:col-span-full">
                Brak wydatków cyklicznych.
              </li>
            ) : null}
          </ul>
        )}
      </main>

      {notice ? (
        <Toast
          key={notice.id}
          data-e2e="recurring:toast"
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
        title="Wystąpił błąd widoku wydatków cyklicznych"
        code={ERROR_CODES.render}
        description="Nie udało się wyświetlić listy. Spróbuj ponownie."
        onRetry={reset}
        backHref={APP_ROUTER.settings()}
      />
    )}
  >
    <Provider>
      <RecurringView />
    </Provider>
  </ErrorBoundary>
);
