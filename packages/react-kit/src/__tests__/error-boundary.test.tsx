import { fireEvent, render, screen } from '@testing-library/react';
import { ErrorBoundary } from '../error-boundary.js';

const Bomb = ({ throws }: { throws: boolean }) => {
  if (throws) throw new Error('boom');
  return <p>ok</p>;
};

describe('Error boundary', () => {
  it('works when children render fine, showing them instead of the fallback', () => {
    render(
      <ErrorBoundary fallback={<p>fallback</p>}>
        <Bomb throws={false} />
      </ErrorBoundary>,
    );

    expect(screen.getByText('ok')).toBeInTheDocument();
  });

  it('works when a child throws, showing the fallback and reporting the error', () => {
    const onError = vi.fn();
    const consoleError = vi
      .spyOn(console, 'error')
      .mockImplementation(() => {});

    render(
      <ErrorBoundary fallback={<p>fallback</p>} onError={onError}>
        <Bomb throws={true} />
      </ErrorBoundary>,
    );

    expect(screen.getByText('fallback')).toBeInTheDocument();
    expect(onError).toHaveBeenCalledExactlyOnceWith(
      expect.any(Error),
      expect.anything(),
    );

    consoleError.mockRestore();
  });

  it('works with a render-prop fallback, exposing the error and a reset callback', () => {
    const consoleError = vi
      .spyOn(console, 'error')
      .mockImplementation(() => {});

    let throws = true;
    const Toggle = () => <Bomb throws={throws} />;

    render(
      <ErrorBoundary
        fallback={({ error, reset }) => (
          <button
            onClick={() => {
              throws = false;
              reset();
            }}
          >
            {error.message}
          </button>
        )}
      >
        <Toggle />
      </ErrorBoundary>,
    );

    fireEvent.click(screen.getByText('boom'));

    expect(screen.getByText('ok')).toBeInTheDocument();

    consoleError.mockRestore();
  });

  it('works when a resetKey changes after an error, recovering automatically', () => {
    const consoleError = vi
      .spyOn(console, 'error')
      .mockImplementation(() => {});

    const { rerender } = render(
      <ErrorBoundary fallback={<p>fallback</p>} resetKeys={[1]}>
        <Bomb throws={true} />
      </ErrorBoundary>,
    );

    expect(screen.getByText('fallback')).toBeInTheDocument();

    rerender(
      <ErrorBoundary fallback={<p>fallback</p>} resetKeys={[2]}>
        <Bomb throws={false} />
      </ErrorBoundary>,
    );

    expect(screen.getByText('ok')).toBeInTheDocument();

    consoleError.mockRestore();
  });
});
