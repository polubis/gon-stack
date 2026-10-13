/** jsdom has no image decoding or canvas: a 400x300 picture and a no-op 2d context. */
export const stubImageCanvas = () => {
  vi.stubGlobal(
    'createImageBitmap',
    vi.fn(async () => ({ width: 400, height: 300, close: () => {} })),
  );
  const context = new Proxy(
    {},
    { get: () => () => {}, set: () => true },
  ) as unknown as CanvasRenderingContext2D;
  vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(context);
  vi.spyOn(HTMLCanvasElement.prototype, 'toBlob').mockImplementation(
    (callback) =>
      callback(
        new Blob(
          [new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])],
          {
            type: 'image/png',
          },
        ),
      ),
  );
};
