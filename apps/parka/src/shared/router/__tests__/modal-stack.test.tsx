import { render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import {
  closeModal,
  openModal,
  useModalMounted,
  useModalStack,
} from '../modal-stack';

const Layer = ({ id }: { id: string }) => {
  useModalMounted(id);
  return <li>{id}</li>;
};

const Stack = () => (
  <ol aria-label="open modals">
    {useModalStack().map((id) => (
      <Layer key={id} id={id} />
    ))}
  </ol>
);

const open = () =>
  screen.queryAllByRole('listitem').map((li) => li.textContent);
const urlModals = () =>
  new URLSearchParams(window.location.search).getAll('modal');

describe('modal stack', () => {
  it('stacks opened modals in the URL, bottom first', async () => {
    render(<Stack />);

    openModal('a');
    openModal('b');

    await waitFor(() => expect(open()).toEqual(['a', 'b']));
    expect(urlModals()).toEqual(['a', 'b']);
  });

  it('ignores opening a modal that is already open', async () => {
    render(<Stack />);
    openModal('a');
    const entries = window.history.length;

    openModal('a');

    expect(window.history.length).toBe(entries);
    await waitFor(() => expect(open()).toEqual(['a']));
  });

  it('closes the top modal like browser Back', async () => {
    render(<Stack />);
    openModal('a');
    openModal('b');

    closeModal('b');

    await waitFor(() => expect(open()).toEqual(['a']));
    expect(urlModals()).toEqual(['a']);
  });

  it('steps back once when the same modal is closed twice', async () => {
    window.history.replaceState(null, '', '/?page=1');
    render(<Stack />);
    openModal('a');
    await waitFor(() => expect(open()).toEqual(['a']));

    closeModal('a');
    closeModal('a');

    await waitFor(() => expect(open()).toEqual([]));
    expect(window.location.search).toBe('?page=1');
  });

  it('removes a modal buried under another without touching it', async () => {
    render(<Stack />);
    openModal('a');
    openModal('b');

    closeModal('a');

    await waitFor(() => expect(open()).toEqual(['b']));
  });

  it('restores the stack from the URL, one modal per commit', async () => {
    window.history.replaceState(null, '', '/?modal=a&modal=b&modal=c');

    render(<Stack />);

    await waitFor(() => expect(open()).toEqual(['a', 'b', 'c']));
  });

  it('keeps the page when a deep-linked modal is closed', async () => {
    window.history.replaceState(null, '', '/?modal=a');
    render(<Stack />);
    const entries = window.history.length;

    closeModal('a');

    await waitFor(() => expect(open()).toEqual([]));
    expect(window.history.length).toBe(entries);
    expect(urlModals()).toEqual([]);
  });

  it('follows the browser Back button', async () => {
    render(<Stack />);
    openModal('a');
    openModal('b');

    window.history.back();

    await waitFor(() => expect(open()).toEqual(['a']));
  });
});
