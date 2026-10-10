import { createRef } from 'react';
import type { FormEvent } from 'react';
import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { Button } from '../button.js';

describe('button works when', () => {
  const user = userEvent.setup();

  it('is a non-submitting button by default', () => {
    render(<Button.Root>Save</Button.Root>);
    expect(screen.getByRole('button', { name: 'Save' })).toHaveAttribute(
      'type',
      'button',
    );
  });

  it('exposes primary variant by default', () => {
    render(<Button.Root>Save</Button.Root>);
    expect(screen.getByRole('button')).toHaveAttribute(
      'data-variant',
      'primary',
    );
  });

  it('exposes chosen variant', () => {
    render(<Button.Root variant="ghost">Save</Button.Root>);
    expect(screen.getByRole('button')).toHaveAttribute('data-variant', 'ghost');
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

  it('is not focusable when disabled', async () => {
    render(<Button.Root disabled>Save</Button.Root>);
    await user.tab();
    expect(screen.getByRole('button')).not.toHaveFocus();
  });

  it('submits a form only when type is submit', async () => {
    const onSubmit = vi.fn((e: FormEvent) => e.preventDefault());
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

  it('resets a form when type is reset', async () => {
    render(
      <form>
        <input aria-label="Name" defaultValue="a" />
        <Button.Root type="reset">Reset</Button.Root>
      </form>,
    );
    await user.type(screen.getByLabelText('Name'), 'bc');
    await user.click(screen.getByRole('button', { name: 'Reset' }));
    expect(screen.getByLabelText('Name')).toHaveValue('a');
  });

  it('names an icon-only button via aria-label', () => {
    render(
      <Button.Root aria-label="Close">
        <svg aria-hidden="true" />
      </Button.Root>,
    );
    expect(screen.getByRole('button', { name: 'Close' })).toBeInTheDocument();
  });

  it('forwards ref to the button element', () => {
    const ref = createRef<HTMLButtonElement>();
    render(<Button.Root ref={ref}>Save</Button.Root>);
    expect(ref.current).toBe(screen.getByRole('button'));
  });

  it('keeps consumer className, style and native props', () => {
    render(
      <Button.Root className="x" style={{ color: 'red' }} title="t">
        Save
      </Button.Root>,
    );
    const el = screen.getByRole('button');
    expect(el).toHaveClass('x');
    expect(el).toHaveStyle({ color: 'rgb(255, 0, 0)' });
    expect(el).toHaveAttribute('title', 't');
  });

  it('keeps stable styling hook', () => {
    render(<Button.Root>Save</Button.Root>);
    expect(screen.getByRole('button')).toHaveAttribute('data-ds-button');
  });

  it('exposes danger variant', () => {
    render(<Button.Root variant="danger">Delete</Button.Root>);
    expect(screen.getByRole('button')).toHaveAttribute(
      'data-variant',
      'danger',
    );
  });
});
