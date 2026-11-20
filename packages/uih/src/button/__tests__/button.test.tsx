import { createRef } from 'react';
import type { FormEvent } from 'react';
import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { Button } from '../index.js';

describe('button works when', () => {
  const user = userEvent.setup();

  it('is a non-submitting button by default', () => {
    render(<Button.Root>Save</Button.Root>);
    expect(screen.getByRole('button', { name: 'Save' })).toHaveAttribute(
      'type',
      'button',
    );
  });

  it('is marked with the root hook', () => {
    render(<Button.Root>Save</Button.Root>);
    expect(screen.getByRole('button')).toHaveAttribute('data-ds', 'button');
  });

  it('defaults to solid primary medium', () => {
    render(<Button.Root>Save</Button.Root>);
    const button = screen.getByRole('button');
    expect(button).toHaveAttribute('data-appearance', 'solid');
    expect(button).toHaveAttribute('data-color', 'primary');
    expect(button).toHaveAttribute('data-size', 'm');
  });

  it.each(['s', 'm', 'l'] as const)('exposes size %s', (size) => {
    render(<Button.Root size={size}>Save</Button.Root>);
    expect(screen.getByRole('button')).toHaveAttribute('data-size', size);
  });

  it('runs onClick on pointer click', async () => {
    const onClick = vi.fn();
    render(<Button.Root onClick={onClick}>Save</Button.Root>);
    await user.click(screen.getByRole('button'));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it.each(['{Enter}', ' '])('runs onClick on keyboard %j', async (key) => {
    const onClick = vi.fn();
    render(<Button.Root onClick={onClick}>Save</Button.Root>);
    await user.tab();
    await user.keyboard(key);
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('ignores clicks when disabled', async () => {
    const onClick = vi.fn();
    render(
      <Button.Root disabled onClick={onClick}>
        Save
      </Button.Root>,
    );
    await user.click(screen.getByRole('button'));
    expect(onClick).not.toHaveBeenCalled();
  });

  it('submits a form only when type is submit', async () => {
    const onSubmit = vi.fn((event: FormEvent) => event.preventDefault());
    render(
      <form onSubmit={onSubmit}>
        <Button.Root>Plain</Button.Root>
        <Button.Root type="submit">Send</Button.Root>
      </form>,
    );
    await user.click(screen.getByRole('button', { name: 'Plain' }));
    expect(onSubmit).not.toHaveBeenCalled();
    await user.click(screen.getByRole('button', { name: 'Send' }));
    expect(onSubmit).toHaveBeenCalledTimes(1);
  });

  it('passes ref, className, aria and data attributes through', () => {
    const ref = createRef<HTMLButtonElement>();
    render(
      <Button.Root ref={ref} className="mine" aria-label="Go" data-x="1">
        Save
      </Button.Root>,
    );
    const button = screen.getByRole('button', { name: 'Go' });
    expect(ref.current).toBe(button);
    expect(button).toHaveClass('mine');
    expect(button).toHaveAttribute('data-x', '1');
  });

  it('keeps library hooks when consumer passes conflicting data attributes', () => {
    render(<Button.Root data-ds="other">Save</Button.Root>);
    expect(screen.getByRole('button')).toHaveAttribute('data-ds', 'button');
  });
});
