import { afterEach, describe, expect, it, vi } from 'vitest';
import { trackKeyboardInset } from '../keyboard-inset';

const stubViewport = (innerHeight: number, height: number, offsetTop = 0) => {
  const viewport = Object.assign(new EventTarget(), { height, offsetTop });
  vi.stubGlobal('innerHeight', innerHeight);
  vi.stubGlobal('visualViewport', viewport);
  return viewport;
};

const inset = () =>
  document.documentElement.style.getPropertyValue('--kb-inset');

describe('on-screen keyboard inset', () => {
  afterEach(() => vi.unstubAllGlobals());

  it('starts without an inset', () => {
    stubViewport(800, 800);
    const stop = trackKeyboardInset();

    expect(inset()).toBe('0px');
    stop();
  });

  it('exposes the height the keyboard covers', () => {
    const viewport = stubViewport(800, 800);
    const stop = trackKeyboardInset();

    viewport.height = 480;
    viewport.dispatchEvent(new Event('resize'));

    expect(inset()).toBe('320px');
    stop();
  });

  it('starts with the height the keyboard already covers', () => {
    stubViewport(800, 500);
    const stop = trackKeyboardInset();

    expect(inset()).toBe('300px');
    stop();
  });

  it('drops the inset when the keyboard closes', () => {
    const viewport = stubViewport(800, 500);
    const stop = trackKeyboardInset();

    viewport.height = 800;
    viewport.dispatchEvent(new Event('resize'));

    expect(inset()).toBe('0px');
    stop();
  });

  it('removes the inset on cleanup', () => {
    stubViewport(800, 500);
    const stop = trackKeyboardInset();

    stop();

    expect(inset()).toBe('');
  });
});
