import { screen, waitFor, within } from '@testing-library/react';

/** Add button of the empty-state card (the header menu also says "Dodaj"). */
export const emptyAdd = async () => {
  await waitFor(() => {
    if (!findEmpty()) throw new Error('no empty state');
  });
  return within(findEmpty()!).getByRole('button', { name: 'Dodaj' });
};

const findEmpty = () =>
  screen
    .queryAllByRole('status')
    .find((status) => within(status).queryByRole('heading') !== null);
