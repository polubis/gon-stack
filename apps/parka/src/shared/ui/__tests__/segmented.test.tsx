import { useState } from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { Segmented, segmentedIds } from '../controls';

const OPTIONS = [
  { value: 'a', label: 'Pierwsza' },
  { value: 'b', label: 'Druga' },
  { value: 'c', label: 'Trzecia' },
] as const;

const Harness = ({ panel }: { panel?: string }) => {
  const [value, setValue] = useState('a');
  return (
    <>
      <Segmented<string>
        label="Widok"
        options={[...OPTIONS]}
        value={value}
        onChange={setValue}
        panel={panel}
      />
      <div role="tabpanel" id="p-panel" aria-labelledby={`p-tab-${value}`}>
        {value}
      </div>
    </>
  );
};

describe('Segmented keyboard', () => {
  it('keeps one tab in the tab order and moves with arrows, Home and End', async () => {
    render(<Harness />);
    const tab = (name: string) => screen.getByRole('tab', { name });

    expect(tab('Pierwsza')).toHaveAttribute('tabindex', '0');
    expect(tab('Druga')).toHaveAttribute('tabindex', '-1');

    tab('Pierwsza').focus();
    await userEvent.keyboard('{ArrowRight}');
    expect(tab('Druga')).toHaveFocus();
    expect(tab('Druga')).toHaveAttribute('aria-selected', 'true');

    await userEvent.keyboard('{End}');
    expect(tab('Trzecia')).toHaveFocus();

    await userEvent.keyboard('{ArrowRight}');
    expect(tab('Pierwsza')).toHaveFocus();

    await userEvent.keyboard('{ArrowLeft}');
    expect(tab('Trzecia')).toHaveFocus();

    await userEvent.keyboard('{Home}');
    expect(tab('Pierwsza')).toHaveFocus();
    expect(tab('Pierwsza')).toHaveAttribute('aria-selected', 'true');
  });

  it('points every tab at its panel and names the panel by the tab', () => {
    render(<Harness panel="p" />);

    expect(screen.getByRole('tab', { name: 'Druga' })).toHaveAttribute(
      'aria-controls',
      segmentedIds('p', 'b').panel,
    );
    expect(screen.getByRole('tabpanel', { name: 'Pierwsza' })).toBeVisible();
  });
});
