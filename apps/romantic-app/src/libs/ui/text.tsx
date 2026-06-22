import { type ComponentProps, createElement, type ElementType } from 'react';

import { cn } from '@repo/react-kit/cn';

/* =============================================================================
 * Shared Types
 * ============================================================================= */

type TextVariant =
  | 't1'
  | 't2'
  | 't3'
  | 't4'
  | 't5'
  | 't6'
  | 'b1'
  | 'b2'
  | 'b3'
  | 'c1'
  | 'c2'
  | 'l1'
  | 'l2'
  | 'v1'
  | 'v2'
  | 'o1'
  | 'o2';

type TextBaseProps<TAs extends ElementType> = {
  as?: TAs;
  className?: string;
} & Omit<ComponentProps<TAs>, 'as' | 'className'>;

type TextPartProps<TAs extends ElementType = 'span'> = TextBaseProps<TAs>;

/* =============================================================================
 * Internal Factory
 * ============================================================================= */

const createTextPart = <TDefaultAs extends ElementType>(
  variant: TextVariant,
  defaultAs: TDefaultAs,
) => {
  const TextPart = <TAs extends ElementType = TDefaultAs>({
    as,
    className,
    ...props
  }: TextPartProps<TAs>) => {
    const tag = (as ?? defaultAs) as ElementType;

    return createElement(tag, {
      className: cn(variant, className),
      ...props,
    });
  };

  return TextPart;
};

/* =============================================================================
 * Compound Parts
 * ============================================================================= */

export const T1 = createTextPart('t1', 'h1');
export const T2 = createTextPart('t2', 'h2');
export const T3 = createTextPart('t3', 'h3');
export const T4 = createTextPart('t4', 'h4');
export const T5 = createTextPart('t5', 'h5');
export const T6 = createTextPart('t6', 'h6');
export const B1 = createTextPart('b1', 'p');
export const B2 = createTextPart('b2', 'p');
export const B3 = createTextPart('b3', 'p');
export const C1 = createTextPart('c1', 'span');
export const C2 = createTextPart('c2', 'span');
export const L1 = createTextPart('l1', 'span');
export const L2 = createTextPart('l2', 'span');
export const V1 = createTextPart('v1', 'span');
export const V2 = createTextPart('v2', 'span');
export const O1 = createTextPart('o1', 'p');
export const O2 = createTextPart('o2', 'p');

/* =============================================================================
 * Compound Export
 * ============================================================================= */

export const Text = {
  T1,
  T2,
  T3,
  T4,
  T5,
  T6,
  B1,
  B2,
  B3,
  C1,
  C2,
  L1,
  L2,
  V1,
  V2,
  O1,
  O2,
};
