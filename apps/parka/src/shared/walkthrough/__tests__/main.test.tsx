import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Leaf, ScanLine } from 'lucide-react';
import { Main } from '../presentation/main';
import type { WalkthroughStep, WalkthroughStepId } from '../domain/models';

const steps: WalkthroughStep[] = [
  {
    id: 1 as WalkthroughStepId,
    icon: Leaf,
    title: 'Step one',
    body: 'First step body',
    cta: 'Next',
  },
  {
    id: 2 as WalkthroughStepId,
    icon: ScanLine,
    title: 'Step two',
    body: 'Second step body',
    cta: 'Finish',
  },
];

const persistenceKey = 'test-walkthrough';

beforeEach(() => {
  window.localStorage.removeItem(persistenceKey);
});

describe('Shared walkthrough works when', () => {
  it('shows the first step on mount', () => {
    render(
      <Main steps={steps} persistenceKey={persistenceKey} onFinish={vi.fn()} />,
    );

    screen.getByRole('heading', { name: 'Step one' });
    screen.getByText('First step body');
  });

  it('advances to the next step and calls onFinish on the last one', async () => {
    const user = userEvent.setup();
    const onFinish = vi.fn();

    render(
      <Main
        steps={steps}
        persistenceKey={persistenceKey}
        onFinish={onFinish}
      />,
    );

    await user.click(screen.getByRole('button', { name: 'Next' }));
    screen.getByRole('heading', { name: 'Step two' });

    await user.click(screen.getByRole('button', { name: 'Finish' }));

    expect(onFinish).toHaveBeenCalledWith('completed');
    expect(window.localStorage.getItem(persistenceKey)).toBe('completed');
  });

  it('skips and persists the skipped outcome', async () => {
    const user = userEvent.setup();
    const onFinish = vi.fn();

    render(
      <Main
        steps={steps}
        persistenceKey={persistenceKey}
        onFinish={onFinish}
      />,
    );

    await user.click(screen.getByRole('button', { name: 'Pomiń' }));

    expect(onFinish).toHaveBeenCalledWith('skipped');
    expect(window.localStorage.getItem(persistenceKey)).toBe('skipped');
  });

  it('shows step one again on remount by default, even if a prior run completed it', () => {
    window.localStorage.setItem(persistenceKey, 'completed');

    render(
      <Main steps={steps} persistenceKey={persistenceKey} onFinish={vi.fn()} />,
    );

    screen.getByRole('heading', { name: 'Step one' });
  });

  it('resumes as finished when the caller opts into resumePersistedOutcome', () => {
    window.localStorage.setItem(persistenceKey, 'completed');
    const onFinish = vi.fn();

    const { container } = render(
      <Main
        steps={steps}
        persistenceKey={persistenceKey}
        onFinish={onFinish}
        resumePersistedOutcome
      />,
    );

    expect(container).toBeEmptyDOMElement();
    expect(onFinish).toHaveBeenCalledWith('completed');
  });
});
