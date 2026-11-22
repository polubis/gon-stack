import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { Markdown } from '../presentation/markdown';

describe('Markdown', () => {
  it('renders headings, emphasis and inline code', () => {
    render(
      <Markdown source={'# Tytuł\n\nTo jest **ważne**, *kursywa* i `code`.'} />,
    );

    expect(screen.getByRole('heading', { name: 'Tytuł' })).toBeVisible();
    expect(screen.getByText('ważne').tagName).toBe('STRONG');
    expect(screen.getByText('kursywa').tagName).toBe('EM');
    expect(screen.getByText('code').tagName).toBe('CODE');
  });

  it('renders bullet and numbered lists', () => {
    render(<Markdown source={'- a\n- b\n\n1. jeden\n2. dwa'} />);

    const [bullets, numbers] = screen.getAllByRole('list');
    expect(within(bullets!).getAllByRole('listitem')).toHaveLength(2);
    expect(within(numbers!).getByText('dwa')).toBeVisible();
  });

  it('keeps a fenced code block verbatim', () => {
    render(<Markdown source={'```ts\nconst a = **1**;\n```'} />);

    expect(screen.getByText('const a = **1**;')).toBeVisible();
  });

  it('renders a blockquote and a table', () => {
    render(<Markdown source={'> cytat\n\n| A | B |\n| - | - |\n| 1 | 2 |'} />);

    expect(screen.getByText('cytat')).toBeVisible();
    expect(screen.getByRole('columnheader', { name: 'A' })).toBeVisible();
    expect(screen.getByRole('cell', { name: '2' })).toBeVisible();
  });

  it('opens safe links in a new tab without opener', () => {
    render(<Markdown source="[Docs](https://example.com/a)" />);

    const link = screen.getByRole('link', { name: 'Docs' });
    expect(link).toHaveAttribute('href', 'https://example.com/a');
    expect(link).toHaveAttribute('target', '_blank');
    expect(link.getAttribute('rel')).toContain('noopener');
  });

  it('drops links with unsafe protocols', () => {
    const { container } = render(
      <Markdown source="[Klik](javascript:alert(1))" />,
    );

    expect(screen.queryByRole('link')).toBeNull();
    expect(container).toHaveTextContent('Klik');
  });

  it('shows raw HTML as text instead of running it', () => {
    const { container } = render(
      <Markdown source={'<img src=x onerror="alert(1)"> <script>x</script>'} />,
    );

    expect(container.querySelector('img, script')).toBeNull();
    expect(container).toHaveTextContent('<script>x</script>');
  });

  it('drops links with mixed-case or data schemes', () => {
    render(
      <Markdown source="[A](JaVaScRiPt:alert(1)) [B](data:text/html,x) [C](https://ok.dev/a)" />,
    );

    expect(screen.queryByRole('link', { name: 'A' })).toBeNull();
    expect(screen.queryByRole('link', { name: 'B' })).toBeNull();
    expect(screen.getByRole('link', { name: 'C' })).toHaveAttribute(
      'href',
      'https://ok.dev/a',
    );
  });
  describe('quiz', () => {
    const quiz = (body: string) => '```quiz\n' + body + '\n```';

    it('checks an open text answer ignoring case and spaces', async () => {
      const user = userEvent.setup();
      render(
        <Markdown
          source={quiz(
            'type: text\nquestion: Stolica?\nanswer: Warszawa | Warsaw',
          )}
        />,
      );

      await user.type(
        screen.getByRole('textbox', { name: 'Odpowiedź 1' }),
        '  warsaw ',
      );
      await user.click(screen.getByRole('button', { name: 'Sprawdź' }));

      expect(screen.getByRole('status')).toHaveTextContent(
        'Poprawna odpowiedź',
      );
    });

    it('reports a wrong single choice and a right one', async () => {
      const user = userEvent.setup();
      render(
        <Markdown
          source={quiz('type: single\nquestion: 2+2?\n- [ ] 3\n- [x] 4')}
        />,
      );

      await user.click(screen.getByRole('radio', { name: '3' }));
      await user.click(screen.getByRole('button', { name: 'Sprawdź' }));
      expect(screen.getByRole('status')).toHaveTextContent(
        'Niepoprawna odpowiedź',
      );

      await user.click(screen.getByRole('radio', { name: '4' }));
      expect(screen.getByRole('status')).toBeEmptyDOMElement();
      await user.click(screen.getByRole('button', { name: 'Sprawdź' }));
      expect(screen.getByRole('status')).toHaveTextContent(
        'Poprawna odpowiedź',
      );
    });

    it('needs every correct option in multiple choice', async () => {
      const user = userEvent.setup();
      render(
        <Markdown
          source={quiz(
            'type: multiple\nquestion: Parzyste?\n- [x] 2\n- [ ] 3\n- [x] 4',
          )}
        />,
      );

      await user.click(screen.getByRole('checkbox', { name: '2' }));
      await user.click(screen.getByRole('button', { name: 'Sprawdź' }));
      expect(screen.getByRole('status')).toHaveTextContent(
        'Niepoprawna odpowiedź',
      );

      await user.click(screen.getByRole('checkbox', { name: '4' }));
      await user.click(screen.getByRole('button', { name: 'Sprawdź' }));
      expect(screen.getByRole('status')).toHaveTextContent(
        'Poprawna odpowiedź',
      );
    });

    it('does not keep answers after remount', async () => {
      const user = userEvent.setup();
      const source = quiz('type: single\nquestion: Q?\n- [x] a\n- [ ] b');
      const { unmount } = render(<Markdown source={source} />);
      await user.click(screen.getByRole('radio', { name: 'a' }));
      unmount();

      render(<Markdown source={source} />);

      expect(screen.getByRole('radio', { name: 'a' })).not.toBeChecked();
    });

    it('clears the text answer with the x button', async () => {
      const user = userEvent.setup();
      render(<Markdown source={quiz('type: text\nquestion: Q?\nanswer: a')} />);
      const input = screen.getByRole('textbox', { name: 'Odpowiedź 1' });

      await user.type(input, 'abc');
      await user.click(
        screen.getByRole('button', { name: 'Wyczyść odpowiedź' }),
      );

      expect(input).toHaveValue('');
      expect(input).toHaveFocus();
    });

    it('shows an invalid quiz as plain code', () => {
      render(
        <Markdown
          source={quiz('type: single\nquestion: Q?\n- [ ] a\n- [ ] b')}
        />,
      );

      expect(screen.queryByRole('button', { name: 'Sprawdź' })).toBeNull();
      expect(screen.getByText(/type: single/)).toBeVisible();
    });
  });
});
