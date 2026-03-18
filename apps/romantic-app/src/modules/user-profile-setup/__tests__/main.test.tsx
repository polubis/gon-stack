import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Main } from '..';
import { backendFixture } from '../../../__tests__/backend-fixture';

describe('User profile setup works when', () => {
  const mockBackend = backendFixture({ beforeAll, afterAll, afterEach });

  it('displays welcome screen', () => {
    const { asFragment } = render(<Main />);
    expect(asFragment()).toMatchSnapshot();
  });

  it('loads config from mocked backend and opens first step', async () => {
    mockBackend();

    const user = userEvent.setup();

    render(<Main />);

    await user.click(screen.getByRole('button', { name: /let's go/i }));

    expect(
      await screen.findByRole('heading', { name: 'Basics' }),
    ).toBeInTheDocument();
    expect(screen.getByText('Tell us about you')).toBeInTheDocument();
    expect(screen.getByText('How should we call you?')).toBeInTheDocument();
  });
});
