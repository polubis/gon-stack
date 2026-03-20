import { type ComponentProps } from 'react';

import { cn } from './cn';

/* =============================================================================
 * Public Props
 * ============================================================================= */

export type TextH1Props = ComponentProps<'h1'>;
export type TextH2Props = ComponentProps<'h2'>;
export type TextH3Props = ComponentProps<'h3'>;
export type TextH4Props = ComponentProps<'h4'>;
export type TextH5Props = ComponentProps<'h5'>;
export type TextH6Props = ComponentProps<'h6'>;
export type TextB1Props = ComponentProps<'p'>;
export type TextB2Props = ComponentProps<'p'>;
export type TextB3Props = ComponentProps<'p'>;
export type TextC1Props = ComponentProps<'span'>;
export type TextC2Props = ComponentProps<'span'>;
export type TextL1Props = ComponentProps<'label'>;
export type TextL2Props = ComponentProps<'label'>;
export type TextV1Props = ComponentProps<'span'>;
export type TextV2Props = ComponentProps<'span'>;
export type TextO1Props = ComponentProps<'p'>;
export type TextO2Props = ComponentProps<'p'>;

/* =============================================================================
 * Headings
 * ============================================================================= */

export const TextH1 = ({ className, ...props }: TextH1Props) => {
  return (
    <h1
      className={cn(
        'font-heading text-5xl leading-tight text-(--text-h1-color)',
        className,
      )}
      {...props}
    />
  );
};

export const TextH2 = ({ className, ...props }: TextH2Props) => {
  return (
    <h2
      className={cn(
        'font-heading text-4xl leading-tight text-(--text-h2-color)',
        className,
      )}
      {...props}
    />
  );
};

export const TextH3 = ({ className, ...props }: TextH3Props) => {
  return (
    <h3
      className={cn(
        'font-heading text-3xl leading-tight text-(--text-h3-color)',
        className,
      )}
      {...props}
    />
  );
};

export const TextH4 = ({ className, ...props }: TextH4Props) => {
  return (
    <h4
      className={cn(
        'font-heading text-2xl leading-snug text-(--text-h4-color)',
        className,
      )}
      {...props}
    />
  );
};

export const TextH5 = ({ className, ...props }: TextH5Props) => {
  return (
    <h5
      className={cn(
        'font-heading text-xl leading-snug text-(--text-h5-color)',
        className,
      )}
      {...props}
    />
  );
};

export const TextH6 = ({ className, ...props }: TextH6Props) => {
  return (
    <h6
      className={cn(
        'font-heading text-lg leading-snug text-(--text-h6-color)',
        className,
      )}
      {...props}
    />
  );
};

/* =============================================================================
 * Body
 * ============================================================================= */

export const TextB1 = ({ className, ...props }: TextB1Props) => {
  return (
    <p
      className={cn(
        'font-sans text-base leading-relaxed text-(--text-b1-color)',
        className,
      )}
      {...props}
    />
  );
};

export const TextB2 = ({ className, ...props }: TextB2Props) => {
  return (
    <p
      className={cn(
        'font-sans text-sm leading-relaxed text-(--text-b2-color)',
        className,
      )}
      {...props}
    />
  );
};

export const TextB3 = ({ className, ...props }: TextB3Props) => {
  return (
    <p
      className={cn(
        'font-sans text-xs leading-relaxed text-(--text-b3-color)',
        className,
      )}
      {...props}
    />
  );
};

/* =============================================================================
 * Utility
 * ============================================================================= */

export const TextC1 = ({ className, ...props }: TextC1Props) => {
  return (
    <span
      className={cn(
        'font-sans text-xs leading-normal text-(--text-c1-color)',
        className,
      )}
      {...props}
    />
  );
};

export const TextC2 = ({ className, ...props }: TextC2Props) => {
  return (
    <span
      className={cn(
        'font-sans text-[0.6875rem] leading-normal text-(--text-c2-color)',
        className,
      )}
      {...props}
    />
  );
};

export const TextL1 = ({ className, ...props }: TextL1Props) => {
  return (
    <label
      className={cn(
        'font-sans text-xs font-semibold uppercase tracking-[0.14em] text-(--text-l1-color)',
        className,
      )}
      {...props}
    />
  );
};

export const TextL2 = ({ className, ...props }: TextL2Props) => {
  return (
    <label
      className={cn(
        'font-sans text-[0.6875rem] font-medium uppercase tracking-[0.12em] text-(--text-l2-color)',
        className,
      )}
      {...props}
    />
  );
};

export const TextV1 = ({ className, ...props }: TextV1Props) => {
  return (
    <span
      className={cn(
        'font-sans text-xs font-semibold uppercase tracking-[0.2em] text-(--text-v1-color)',
        className,
      )}
      {...props}
    />
  );
};

export const TextV2 = ({ className, ...props }: TextV2Props) => {
  return (
    <span
      className={cn(
        'font-sans text-[0.625rem] font-medium uppercase tracking-[0.16em] text-(--text-v2-color)',
        className,
      )}
      {...props}
    />
  );
};

/* =============================================================================
 * Ornamental
 * ============================================================================= */

export const TextO1 = ({ className, ...props }: TextO1Props) => {
  return (
    <p
      className={cn(
        'font-sans text-sm font-medium italic tracking-[0.02em] text-(--text-o1-color)',
        className,
      )}
      {...props}
    />
  );
};

export const TextO2 = ({ className, ...props }: TextO2Props) => {
  return (
    <p
      className={cn(
        'font-sans text-xs font-medium italic tracking-[0.02em] text-(--text-o2-color)',
        className,
      )}
      {...props}
    />
  );
};

/* =============================================================================
 * Proper Export
 * ============================================================================= */

export const Text = {
  H1: TextH1,
  H2: TextH2,
  H3: TextH3,
  H4: TextH4,
  H5: TextH5,
  H6: TextH6,
  B1: TextB1,
  B2: TextB2,
  B3: TextB3,
  C1: TextC1,
  C2: TextC2,
  L1: TextL1,
  L2: TextL2,
  Overline: TextV1,
  V1: TextV1,
  V2: TextV2,
  O1: TextO1,
  O2: TextO2,
};
