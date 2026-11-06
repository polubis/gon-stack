import '@testing-library/jest-dom';
import { cleanup } from '@testing-library/react';

// jsdom gaps: browser APIs the components rely on.
Element.prototype.scrollIntoView = () => {};
Element.prototype.getAnimations = () => [];
window.matchMedia = (query: string) =>
  ({
    matches: false,
    media: query,
    addEventListener: () => {},
    removeEventListener: () => {},
  }) as unknown as MediaQueryList;

afterEach(() => {
  cleanup();
});
