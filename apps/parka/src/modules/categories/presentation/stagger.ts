/** Entrance delay for the `step`-th row; capped so the whole entrance stays short. */
export const stagger = (step: number) => ({
  animationDelay: `${Math.min(step, 8) * 30}ms`,
});
