import { useEffect } from 'react';
import { useModalStack } from '@/shared/router/modal-stack';
import { Toast } from '@/shared/ui/toast';
import { CategoriesDialog } from './categories-dialog';
import { CategoryDialog } from './category-dialog';
import { Provider, useContext } from './context';
import { CATEGORIES_LIST_MODAL, NEW_CATEGORY_MODAL } from './modal-ids';

const MODALS: readonly string[] = [NEW_CATEGORY_MODAL, CATEGORIES_LIST_MODAL];

const Modals = () => {
  const ctx = useContext();
  const stack = useModalStack();
  const notice = ctx.useNotice();
  const needed = stack.some((modal) => MODALS.includes(modal));

  // Categories are fetched only once one of the popups is asked for.
  useEffect(() => {
    if (needed) ctx.load();
  }, [ctx, needed]);

  return (
    <>
      {stack.map((modal) =>
        modal === NEW_CATEGORY_MODAL ? (
          <CategoryDialog key={modal} modal={modal} />
        ) : modal === CATEGORIES_LIST_MODAL ? (
          <CategoriesDialog key={modal} modal={modal} />
        ) : null,
      )}
      {notice ? (
        <Toast
          key={notice.id}
          data-e2e="categories:toast"
          notice={notice}
          onClose={ctx.dismissNotice}
        />
      ) : null}
    </>
  );
};

/** Renders the category popups that are open in the URL stack, with their toasts. */
export const CategoryModals = () => (
  <Provider>
    <Modals />
  </Provider>
);
