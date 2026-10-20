import { useModalStack } from '@/shared/router/modal-stack';
import { CategoriesDialog } from './categories-dialog';
import { CategoryDialog } from './category-dialog';
import {
  CATEGORIES_MODAL,
  editedTitleOf,
  NEW_CATEGORY_MODAL,
  NEW_PRIORITY_MODAL,
  NEW_TASK_MODAL,
} from './modal-ids';
import { PriorityDialog } from './priority-dialog';
import { findTask, TaskDialog } from './task-dialog';

const dialog = (modal: string) => {
  if (modal === NEW_TASK_MODAL) return <TaskDialog key={modal} modal={modal} />;
  if (modal === NEW_CATEGORY_MODAL)
    return <CategoryDialog key={modal} modal={modal} />;
  if (modal === NEW_PRIORITY_MODAL)
    return <PriorityDialog key={modal} modal={modal} />;
  if (modal === CATEGORIES_MODAL)
    return <CategoriesDialog key={modal} modal={modal} />;
  const title = editedTitleOf(modal);
  const task = title === null ? undefined : findTask(title);
  return task ? <TaskDialog key={modal} modal={modal} task={task} /> : null;
};

/** Renders the popups that are open in the URL stack. */
export const TaskModals = () => <>{useModalStack().map(dialog)}</>;
