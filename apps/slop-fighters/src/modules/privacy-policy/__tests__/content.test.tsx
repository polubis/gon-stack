import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { Content } from '../presentation/content';

describe('Privacy policy', () => {
  it('names controller with NIP and e-mail', () => {
    render(<Content />);

    expect(screen.getByText(/NIP: 7393979495/)).toBeInTheDocument();
    expect(
      screen.getAllByText(/biuro\.masazdebek@gmail\.com/).length,
    ).toBeGreaterThan(0);
  });

  it('lists data subject rights and UODO complaint', () => {
    render(<Content />);

    expect(screen.getByText(/art\. 15\), sprostowania/)).toBeInTheDocument();
    expect(
      screen.getByText(/ul\. Stawki 2, 00-193 Warszawa/),
    ).toBeInTheDocument();
  });

  it('explains how to withdraw consent', () => {
    render(<Content />);

    expect(
      screen.getByText(/równie łatwo, jak ją wyrazić/),
    ).toBeInTheDocument();
  });
});
