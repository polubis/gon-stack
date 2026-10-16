import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Main } from '../presentation/main';
import type { WalkthroughStep, WalkthroughStepId } from '../domain/models';

const Picture = () => <svg data-testid="picture" />;

const steps: WalkthroughStep[] = [
  {
    id: 1 as WalkthroughStepId,
    illustration: Picture,
    title: 'Step one',
    body: 'First step body',
    cta: 'Next',
  },
  {
    id: 2 as WalkthroughStepId,
    illustration: Picture,
    title: 'Step two',
    body: 'Second step body',
    cta: 'Finish',
  },
];

describe('Shared walkthrough works when', () => {
  it('shows the first step with its picture on mount', () => {
    render(<Main steps={steps} onFinish={vi.fn()} />);

    screen.getByRole('heading', { name: 'Step one' });
    screen.getByText('First step body');
    screen.getByTestId('picture');
  });

  it('advances to the next step and finishes as completed on the last one', async () => {
    const user = userEvent.setup();
    const onFinish = vi.fn();
    render(<Main steps={steps} onFinish={onFinish} />);

    await user.click(screen.getByRole('button', { name: 'Next' }));
    screen.getByRole('heading', { name: 'Step two' });
    await user.click(screen.getByRole('button', { name: 'Finish' }));

    expect(onFinish).toHaveBeenCalledWith('completed');
    expect(screen.queryByRole('heading')).not.toBeInTheDocument();
  });

  it('goes back to the previous step', async () => {
    const user = userEvent.setup();
    render(<Main steps={steps} onFinish={vi.fn()} />);

    expect(
      screen.queryByRole('button', { name: 'Wstecz' }),
    ).not.toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Next' }));
    await user.click(screen.getByRole('button', { name: 'Wstecz' }));

    screen.getByRole('heading', { name: 'Step one' });
  });

  it('pages with arrow keys but never finishes by keyboard alone', async () => {
    const user = userEvent.setup();
    const onFinish = vi.fn();
    render(<Main steps={steps} onFinish={onFinish} />);

    await user.click(screen.getByRole('button', { name: 'Next' }));
    await user.keyboard('{ArrowLeft}');
    screen.getByRole('heading', { name: 'Step one' });
    await user.keyboard('{ArrowRight}');
    await user.keyboard('{ArrowRight}');

    screen.getByRole('heading', { name: 'Step two' });
    expect(onFinish).not.toHaveBeenCalled();
  });

  it('finishes as skipped', async () => {
    const user = userEvent.setup();
    const onFinish = vi.fn();
    render(<Main steps={steps} onFinish={onFinish} />);

    await user.click(screen.getByRole('button', { name: 'Pomiń' }));

    expect(onFinish).toHaveBeenCalledWith('skipped');
  });

  it('offers back in place of skip after the first step', async () => {
    const user = userEvent.setup();
    render(<Main steps={steps} onFinish={vi.fn()} />);

    await user.click(screen.getByRole('button', { name: 'Next' }));

    screen.getByRole('button', { name: 'Wstecz' });
    expect(
      screen.queryByRole('button', { name: 'Pomiń' }),
    ).not.toBeInTheDocument();
  });
});
