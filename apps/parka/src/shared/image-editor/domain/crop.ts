export type Rotation = 0 | 90 | 180 | 270;

export type Size = { width: number; height: number };

/** Crop centre as a share (0..1) of the rotated image. */
export type Center = { x: number; y: number };

export type Rect = { x: number; y: number; side: number };

export const rotatedSize = (
  { width, height }: Size,
  rotation: Rotation,
): Size =>
  rotation === 90 || rotation === 270
    ? { width: height, height: width }
    : { width, height };

export const turn = (rotation: Rotation, quarters: 1 | -1): Rotation =>
  ((rotation + quarters * 90 + 360) % 360) as Rotation;

/** Square area, in pixels of the rotated image, that stays inside it. */
export const cropRect = (
  image: Size,
  rotation: Rotation,
  zoom: number,
  center: Center,
): Rect => {
  const { width, height } = rotatedSize(image, rotation);
  const side = Math.min(width, height) / Math.max(zoom, 1);
  const clamp = (value: number, extent: number) =>
    Math.min(Math.max(value * extent - side / 2, 0), extent - side);
  return { x: clamp(center.x, width), y: clamp(center.y, height), side };
};

/** Centre of the area `rect`, so a clamped rect can be stored back as state. */
export const centerOf = (
  image: Size,
  rotation: Rotation,
  rect: Rect,
): Center => {
  const { width, height } = rotatedSize(image, rotation);
  return {
    x: (rect.x + rect.side / 2) / width,
    y: (rect.y + rect.side / 2) / height,
  };
};

/** Moves the crop by `dx`/`dy` shares of its own side, staying inside. */
export const pan = (
  image: Size,
  rotation: Rotation,
  zoom: number,
  center: Center,
  dx: number,
  dy: number,
): Center => {
  const rect = cropRect(image, rotation, zoom, center);
  const moved = centerOf(image, rotation, {
    ...rect,
    x: rect.x + dx * rect.side,
    y: rect.y + dy * rect.side,
  });
  return centerOf(image, rotation, cropRect(image, rotation, zoom, moved));
};

/** Exported side: the crop at full detail, never above `max`. */
export const outputSide = (side: number, max: number): number =>
  Math.max(1, Math.round(Math.min(side, max)));
