import { screen } from '@testing-library/react';
import type userEvent from '@testing-library/user-event';

/** Opens the edit form the way a user does: row "More" menu, then "Edit". */
export const openEditor = async (
  user: ReturnType<typeof userEvent.setup>,
  title: string,
  backlog = false,
) => {
  const [more] = await screen.findAllByRole('button', {
    name: `Więcej: ${title}`,
  });
  await user.click(more!);
  await user.click(
    await screen.findByRole('menuitem', {
      name: `Edytuj zadanie${backlog ? ' z backlogu' : ''}: ${title}`,
    }),
  );
};
