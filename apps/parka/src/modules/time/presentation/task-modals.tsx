import { useEffect } from 'react';
import {
  closeModal,
  closeModalThen,
  useModalStack,
} from '@/shared/router/modal-stack';
import { CategoriesDialog } from './categories-dialog';
import { CategoryDialog } from './category-dialog';
import { useContext } from './context';
import { DeleteDialog } from './delete-dialog';
import {
  CATEGORIES_MODAL,
  deletedIdOf,
  editedIdOf,
  editTaskModal,
  NEW_CATEGORY_MODAL,
  NEW_PRIORITY_MODAL,
  NEW_TASK_MODAL,
  stoppedIdOf,
} from './modal-ids';
import { PriorityDialog } from './priority-dialog';
import { TaskDialog } from './task-dialog';

/** Renders the popups that are open in the URL stack. */
export const TaskModals = ({ defaultDay }: { defaultDay: string }) => {
  const { tasks, deleteTask, stopRecurring, initializing, isLoading } =
    useContext();
  const stack = useModalStack();

  // A deep link to a task that is gone must not leave a dead `modal=` param.
  useEffect(() => {
    if (initializing || isLoading) return;
    for (const modal of stack) {
      const id = editedIdOf(modal) ?? deletedIdOf(modal) ?? stoppedIdOf(modal);
      if (id !== null && !tasks.some((task) => task.id === id))
        closeModal(modal);
    }
  }, [initializing, isLoading, stack, tasks]);

  const dialog = (modal: string) => {
    if (modal === NEW_TASK_MODAL)
      return <TaskDialog key={modal} modal={modal} defaultDay={defaultDay} />;
    if (modal === NEW_CATEGORY_MODAL)
      return <CategoryDialog key={modal} modal={modal} />;
    if (modal === NEW_PRIORITY_MODAL)
      return <PriorityDialog key={modal} modal={modal} />;
    if (modal === CATEGORIES_MODAL)
      return <CategoriesDialog key={modal} modal={modal} />;

    const editedId = editedIdOf(modal);
    const edited = tasks.find((task) => task.id === editedId);
    if (edited)
      return (
        <TaskDialog
          key={modal}
          modal={modal}
          task={edited}
          defaultDay={defaultDay}
        />
      );

    const deleted = tasks.find((task) => task.id === deletedIdOf(modal));
    if (deleted)
      return (
        <DeleteDialog
          key={modal}
          modal={modal}
          task={deleted}
          onConfirm={() => {
            deleteTask(deleted.id);
            closeModalThen(modal, () => closeModal(editTaskModal(deleted.id)));
          }}
        />
      );

    const stopped = tasks.find((task) => task.id === stoppedIdOf(modal));
    if (stopped?.recurringId)
      return (
        <DeleteDialog
          key={modal}
          modal={modal}
          task={stopped}
          title="Zakończyć cykl?"
          description={`Zadanie „${stopped.title}” przestanie się powtarzać. Dotychczasowe zadania zostaną.`}
          confirmLabel="Zakończ cykl"
          onConfirm={() => {
            if (stopped.recurringId) stopRecurring(stopped.recurringId);
            closeModalThen(modal, () => closeModal(editTaskModal(stopped.id)));
          }}
        />
      );
    return null;
  };

  return <>{stack.map(dialog)}</>;
};
