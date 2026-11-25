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
    await screen.findByRole('button', { name: `Edytuj priorytet ${name}` }),
  );
  return within(
    await screen.findByRole('dialog', { name: 'Edytuj priorytet' }),
  );
};

describe('task priorities', () => {
  it('lists every priority, highest first', async () => {
    renderTime('day', undefined, '&modal=priorities');

    const list = within(
      await screen.findByRole('dialog', { name: 'Priorytety' }),
    );

    expect(
      list
        .getAllByRole('button', { name: /^Edytuj priorytet/ })
        .map((button) => button.getAttribute('aria-label')),
    ).toEqual([
      'Edytuj priorytet Wysoki',
      'Edytuj priorytet Średni',
      'Edytuj priorytet Niski',
    ]);
  });

  it('shows a new priority in the list under the form', async () => {
    const user = userEvent.setup();
    renderTime('day', undefined, '&modal=priorities');
    const list = within(
      await screen.findByRole('dialog', { name: 'Priorytety' }),
    );
    await user.click(list.getByRole('button', { name: 'Dodaj' }));
    const form = within(
      await screen.findByRole('dialog', { name: 'Nowy priorytet' }),
    );

    await user.type(form.getByLabelText('Nazwa'), 'Pilny');
    await user.click(form.getByRole('radio', { name: '9' }));
    await user.click(form.getByRole('button', { name: 'Dodaj priorytet' }));

    expect(
      await screen.findByRole('button', { name: 'Edytuj priorytet Pilny' }),
    ).toBeVisible();
  });

  it('renames a priority and changes its value', async () => {
    const user = userEvent.setup();
    renderTime('day', undefined, '&modal=priorities');

    const form = await openEditor(user, 'Niski');
    const name = form.getByLabelText('Nazwa');
    await user.clear(name);
    await user.type(name, 'Kiedyś');
    await user.click(form.getByRole('radio', { name: '3' }));
    await user.click(form.getByRole('button', { name: 'Zapisz zmiany' }));

    expect(
      await screen.findByRole('button', { name: 'Edytuj priorytet Kiedyś' }),
    ).toBeVisible();
    const [write] = backend.writes();
    expect(write!.body).toMatchObject({ id: 'low', name: 'Kiedyś', value: 3 });
  });

  it('shows the priority only once in the edit form', async () => {
    const user = userEvent.setup();
    renderTime('day', undefined, '&modal=priorities');

    const form = await openEditor(user, 'Niski');

    expect(form.getByLabelText('Nazwa')).toHaveValue('Niski');
    expect(form.queryByText('Tak będzie wyglądać:')).not.toBeInTheDocument();
    expect(form.queryByText('Niski', { selector: 'span' })).toBeNull();
  });

  it('refuses a name another priority already has', async () => {
    const user = userEvent.setup();
    renderTime('day', undefined, '&modal=priorities');

    const form = await openEditor(user, 'Niski');
    const name = form.getByLabelText('Nazwa');
    await user.clear(name);
    await user.type(name, 'Wysoki');
    await user.click(form.getByRole('button', { name: 'Zapisz zmiany' }));

    expect(
      await form.findByText('Priorytet o takiej nazwie już istnieje.'),
    ).toBeVisible();
    expect(backend.writes()).toHaveLength(0);
  });

  it('asks before deleting a priority', async () => {
    const user = userEvent.setup();
    renderTime('day', undefined, '&modal=priorities');
    const form = await openEditor(user, 'Niski');

    await user.click(form.getByRole('button', { name: 'Usuń' }));

    await screen.findByRole('dialog', { name: 'Usunąć priorytet?' });
    expect(backend.writes()).toHaveLength(0);
  });

  it('deletes an unused priority after confirmation', async () => {
    const user = userEvent.setup();
    renderTime('day', undefined, '&modal=priorities');
    const form = await openEditor(user, 'Niski');
    await user.click(form.getByRole('button', { name: 'Usuń' }));
    const confirm = within(
      await screen.findByRole('dialog', { name: 'Usunąć priorytet?' }),
    );

    await user.click(confirm.getByRole('button', { name: 'Usuń' }));

    expect(
      screen.queryByRole('button', { name: 'Edytuj priorytet Niski' }),
    ).toBeNull();
  });

  it('keeps a priority used by tasks and explains why', async () => {
    const user = userEvent.setup();
    backend.seed([task({ priorityId: 'low' })]);
    renderTime('day', undefined, '&modal=priorities');

    const form = await openEditor(user, 'Niski');
    await user.click(form.getByRole('button', { name: 'Usuń' }));
    await user.click(
      within(
        await screen.findByRole('dialog', { name: 'Usunąć priorytet?' }),
      ).getByRole('button', { name: 'Usuń' }),
    );

    expect(await screen.findByText('Priorytet jest używany')).toBeVisible();
    expect(screen.getByText('TASK_PRIORITY_IN_USE')).toBeVisible();
    expect(
      await screen.findByRole('button', { name: 'Edytuj priorytet Niski' }),
    ).toBeVisible();
  });
});
