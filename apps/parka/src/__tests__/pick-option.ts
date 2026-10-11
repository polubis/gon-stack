import { screen } from '@testing-library/react';
import type { UserEvent } from '@testing-library/user-event';

/** Opens a Radix select by its trigger and chooses the option by name. */
export const pickOption = async (
  user: UserEvent,
  trigger: HTMLElement,
  option: string,
) => {
  await user.click(trigger);
  await user.click(await screen.findByRole('option', { name: option }));
};
