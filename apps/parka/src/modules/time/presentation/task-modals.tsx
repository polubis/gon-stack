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
import { BacklogAddDialog } from './backlog-add-dialog';
import { BacklogDialog } from './backlog-dialog';
import {
  BACKLOG_MODAL,
  NEW_BACKLOG_MODAL,
  CATEGORIES_MODAL,
  deletedCategoryIdOf,
  deletedIdOf,
  describedIdOf,
  editCategoryModal,
  editedBacklogIdOf,
  editedCategoryIdOf,
  editedIdOf,
  editTaskModal,
  newTaskDayOf,
  NEW_CATEGORY_MODAL,
  NEW_PRIORITY_MODAL,
  NEW_RECURRING_TASK_MODAL,
  NEW_TASK_MODAL,
  stoppedIdOf,
  viewedIdOf,
} from './modal-ids';
import { PriorityDialog } from './priority-dialog';
import { TaskDialog } from './task-dialog';
import { TaskDescription, TaskDetails } from './task-details';

/** Renders the popups that are open in the URL stack. */
export const TaskModals = ({ defaultDay }: { defaultDay: string }) => {
  const {
    tasks,
    backlog,
    categories,
    deleteTask,
    deleteCategory,
    stopRecurring,
    initializing,
    isLoading,
  } = useContext();
  const stack = useModalStack();

  // A deep link to a task that is gone must not leave a dead `modal=` param.
  useEffect(() => {
    if (initializing || isLoading) return;
    for (const modal of stack) {
      const id =
        editedIdOf(modal) ??
        editedBacklogIdOf(modal) ??
        viewedIdOf(modal) ??
        describedIdOf(modal) ??
        deletedIdOf(modal) ??
        stoppedIdOf(modal);
      if (
        id !== null &&
        !tasks.some((task) => task.id === id) &&
        !backlog.some((task) => task.id === id)
      )
        closeModal(modal);
    }
  }, [initializing, isLoading, stack, tasks, backlog]);

  // Same for a category that is gone (deleted, or never existed).
  useEffect(() => {
    if (initializing) return;
    for (const modal of stack) {
      const id = editedCategoryIdOf(modal) ?? deletedCategoryIdOf(modal);
      if (id !== null && !categories.some((category) => category.id === id))
        closeModal(modal);
    }
  }, [initializing, stack, categories]);

  const dialog = (modal: string) => {
    if (modal === NEW_TASK_MODAL)
      return <TaskDialog key={modal} modal={modal} defaultDay={defaultDay} />;
    if (modal === NEW_RECURRING_TASK_MODAL)
      return (
        <TaskDialog
          key={modal}
          modal={modal}
          defaultDay={defaultDay}
          startRepeating
        />
      );
    if (modal === BACKLOG_MODAL)
      return <BacklogDialog key={modal} modal={modal} />;
    if (modal === NEW_BACKLOG_MODAL)
      return <BacklogAddDialog key={modal} modal={modal} />;
    if (modal === NEW_CATEGORY_MODAL)
      return <CategoryDialog key={modal} modal={modal} />;
    if (modal === NEW_PRIORITY_MODAL)
      return <PriorityDialog key={modal} modal={modal} />;
    if (modal === CATEGORIES_MODAL)
      return <CategoriesDialog key={modal} modal={modal} />;

    const editedCategory = categories.find(
      (category) => category.id === editedCategoryIdOf(modal),
    );
    if (editedCategory)
      return (
        <CategoryDialog key={modal} modal={modal} category={editedCategory} />
      );

    const deletedCategory = categories.find(
      (category) => category.id === deletedCategoryIdOf(modal),
    );
    if (deletedCategory)
      return (
        <DeleteDialog
          key={modal}
          modal={modal}
          task={{ title: deletedCategory.name }}
          title="Usunąć kategorię?"
          description={`Kategorii „${deletedCategory.name}” nie da się usunąć, dopóki używają jej zadania lub cykle.`}
          onConfirm={() => {
            deleteCategory(deletedCategory.id);
            closeModalThen(modal, () =>
              closeModal(editCategoryModal(deletedCategory.id)),
            );
          }}
        />
      );

    const newDay = newTaskDayOf(modal);
    if (newDay !== null)
      return <TaskDialog key={modal} modal={modal} defaultDay={newDay} />;

    const viewed = [...tasks, ...backlog].find(
      (task) => task.id === viewedIdOf(modal),
    );
    if (viewed) return <TaskDetails key={modal} modal={modal} task={viewed} />;

    const described = [...tasks, ...backlog].find(
      (task) => task.id === describedIdOf(modal),
    );
    if (described)
      return <TaskDescription key={modal} modal={modal} task={described} />;

    const editedBacklog = backlog.find(
      (task) => task.id === editedBacklogIdOf(modal),
    );
    if (editedBacklog)
      return (
        <BacklogAddDialog key={modal} modal={modal} task={editedBacklog} />
      );

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

    const deleted = [...tasks, ...backlog].find(
      (task) => task.id === deletedIdOf(modal),
    );
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
