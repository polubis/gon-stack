import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { renderTime } from './render-time';
import { setupTimeBackend, task } from './time-backend';

const backend = setupTimeBackend();

afterEach(() => vi.useRealTimers());

const openEditor = async (
  user: ReturnType<typeof userEvent.setup>,
  name: string,
) => {
  await user.click(
    await screen.findByRole('button', { name: `Edytuj kategorię ${name}` }),
  );
  return within(
    await screen.findByRole('dialog', { name: 'Edytuj kategorię' }),
  );
};

describe('task categories', () => {
  it('renames a category and shows a toast', async () => {
    const user = userEvent.setup();
    renderTime('day', undefined, '&modal=categories');

    const form = await openEditor(user, 'Dom');
    const name = form.getByLabelText('Nazwa');
    await user.clear(name);
    await user.type(name, 'Mieszkanie');
    await user.click(form.getByRole('button', { name: 'Zapisz zmiany' }));

    expect(await screen.findByText('Zapisano zmiany.')).toBeVisible();
    expect(
      await screen.findByRole('button', {
        name: 'Edytuj kategorię Mieszkanie',
      }),
    ).toBeVisible();
    const [write] = backend.writes();
    expect(write).toMatchObject({ method: 'PUT' });
    expect(write!.url).toContain('/api/time/categories/home/');
    expect(write!.body).toMatchObject({ id: 'home', name: 'Mieszkanie' });
  });

  it('refuses a name another category already has', async () => {
    const user = userEvent.setup();
    renderTime('day', undefined, '&modal=categories');

    const form = await openEditor(user, 'Dom');
    const name = form.getByLabelText('Nazwa');
    await user.clear(name);
    await user.type(name, 'Praca');
    await user.click(form.getByRole('button', { name: 'Zapisz zmiany' }));

    expect(
      await form.findByText('Kategoria o takiej nazwie już istnieje.'),
    ).toBeVisible();
    expect(backend.writes()).toHaveLength(0);
  });

  it('deletes an unused category after confirmation', async () => {
    const user = userEvent.setup();
    renderTime('day', undefined, '&modal=categories');

    const form = await openEditor(user, 'Dom');
    await user.click(form.getByRole('button', { name: 'Usuń kategorię' }));
    const confirm = within(
      await screen.findByRole('dialog', { name: 'Usunąć kategorię?' }),
    );
    expect(backend.writes()).toHaveLength(0);
    await user.click(confirm.getByRole('button', { name: 'Usuń' }));

    expect(await screen.findByText('Usunięto kategorię.')).toBeVisible();
    expect(
      screen.queryByRole('button', { name: 'Edytuj kategorię Dom' }),
    ).toBeNull();
  });

  it('keeps a category used by tasks and explains why', async () => {
    const user = userEvent.setup();
    backend.seed([task({ categoryId: 'home' })]);
    renderTime('day', undefined, '&modal=categories');

    const form = await openEditor(user, 'Dom');
    await user.click(form.getByRole('button', { name: 'Usuń kategorię' }));
    await user.click(
      within(
        await screen.findByRole('dialog', { name: 'Usunąć kategorię?' }),
      ).getByRole('button', { name: 'Usuń' }),
    );

    expect(await screen.findByText('Kategoria jest używana')).toBeVisible();
    expect(screen.getByText('TASK_CATEGORY_IN_USE')).toBeVisible();
    expect(
      await screen.findByRole('button', { name: 'Edytuj kategorię Dom' }),
    ).toBeVisible();
  });
});
