type Shape = { kind: 'circle' } | { kind: 'square' } | { kind: 'star' };

export const sides = (shape: Shape): number => {
  switch (shape.kind) {
    case 'circle':
      return 0;
    case 'square':
      return 4;
  }
  return -1;
};
