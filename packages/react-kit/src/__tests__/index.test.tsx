import { render, screen } from '@testing-library/react';

function Greeting({ name }: { name: string }) {
  return <p>Hello, {name}!</p>;
}

describe('Greeting', () => {
  it('renders the name', () => {
    render(<Greeting name="react-kit" />);
    expect(screen.getByText('Hello, react-kit!')).toBeInTheDocument();
  });
});
