import { render, screen } from '@testing-library/react';
import { context } from '../context.js';

describe('React context factory', () => {
  it('works when the hook takes no argument, exposing its return value to consumers', () => {
    const useGreeting = () => 'hello';
    const [GreetingProvider, useGreetingContext] = context(
      'Greeting',
      useGreeting,
    );

    const Consumer = () => <p>{useGreetingContext()}</p>;

    render(
      <GreetingProvider>
        <Consumer />
      </GreetingProvider>,
    );

    expect(screen.getByText('hello')).toBeInTheDocument();
  });

  it("works when the hook takes a value, passing the provider's value prop through to it", () => {
    const useDouble = (value: number) => value * 2;
    const [DoubleProvider, useDoubleContext] = context('Double', useDouble);

    const Consumer = () => <p>{useDoubleContext()}</p>;

    render(
      <DoubleProvider value={21}>
        <Consumer />
      </DoubleProvider>,
    );

    expect(screen.getByText('42')).toBeInTheDocument();
  });

  it('works when the consumer hook is used outside of its provider, throwing a descriptive error', () => {
    const useValue = () => 'value';
    const [, useValueContext] = context('Value', useValue);

    const Consumer = () => <p>{useValueContext()}</p>;

    expect(() => render(<Consumer />)).toThrow(
      'useValueContext must be used within a ValueProvider.',
    );
  });
});
