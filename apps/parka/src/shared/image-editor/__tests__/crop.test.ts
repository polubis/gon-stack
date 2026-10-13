import { describe, expect, it } from 'vitest';
import { cropRect, outputSide, pan, rotatedSize, turn } from '../domain/crop';

const IMAGE = { width: 400, height: 300 };
const MIDDLE = { x: 0.5, y: 0.5 };

describe('image crop area', () => {
  it('starts as the biggest centred square', () => {
    expect(cropRect(IMAGE, 0, 1, MIDDLE)).toEqual({ x: 50, y: 0, side: 300 });
  });

  it('shrinks the square when zooming in', () => {
    expect(cropRect(IMAGE, 0, 2, MIDDLE).side).toBe(150);
  });

  it('never leaves the image', () => {
    expect(cropRect(IMAGE, 0, 2, { x: 0, y: 1 })).toEqual({
      x: 0,
      y: 150,
      side: 150,
    });
  });

  it('swaps width and height after a quarter turn', () => {
    expect(rotatedSize(IMAGE, 90)).toEqual({ width: 300, height: 400 });
    expect(cropRect(IMAGE, 90, 1, MIDDLE)).toEqual({ x: 0, y: 50, side: 300 });
  });

  it('turns both ways around full circle', () => {
    expect(turn(270, 1)).toBe(0);
    expect(turn(0, -1)).toBe(270);
  });

  it('moves by a share of the crop side and stops at the edge', () => {
    const moved = pan(IMAGE, 0, 2, MIDDLE, 0.5, 0);
    expect(cropRect(IMAGE, 0, 2, moved).x).toBe(200);
    const stuck = pan(IMAGE, 0, 2, MIDDLE, 100, 0);
    expect(cropRect(IMAGE, 0, 2, stuck).x).toBe(250);
  });

  it('caps the exported side', () => {
    expect(outputSide(1200, 512)).toBe(512);
    expect(outputSide(150.4, 512)).toBe(150);
  });
});
