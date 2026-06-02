import { type ComponentProps, createElement, type ElementType } from 'react';

import { cn } from './cn';

/* =============================================================================
 * Shared Types
 * ============================================================================= */

type TextVariant =
  | 'mono-label'
  | 'hero-display'
  | 'manifest-heading'
  | 'page-heading'
  | 'section-heading'
  | 'category-heading'
  | 'card-title-lg'
  | 'card-title'
  | 'logo-wordmark'
  | 'footer-brand'
  | 'date-display'
  | 'date-num'
  | 'subsection-heading';

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

export const MonoLabel = createTextPart('mono-label', 'span');
export const HeroDisplay = createTextPart('hero-display', 'h1');
export const ManifestHeading = createTextPart('manifest-heading', 'h2');
export const PageHeading = createTextPart('page-heading', 'h1');
export const SectionHeading = createTextPart('section-heading', 'h2');
export const CategoryHeading = createTextPart('category-heading', 'h3');
export const CardTitleLg = createTextPart('card-title-lg', 'h3');
export const CardTitle = createTextPart('card-title', 'h3');
export const LogoWordmark = createTextPart('logo-wordmark', 'span');
export const FooterBrand = createTextPart('footer-brand', 'span');
export const DateDisplay = createTextPart('date-display', 'span');
export const DateNum = createTextPart('date-num', 'span');
export const SubsectionHeading = createTextPart('subsection-heading', 'h3');

/* =============================================================================
 * Compound Export
 * ============================================================================= */

export const Text = {
  MonoLabel,
  HeroDisplay,
  ManifestHeading,
  PageHeading,
  SectionHeading,
  CategoryHeading,
  CardTitleLg,
  CardTitle,
  LogoWordmark,
  FooterBrand,
  DateDisplay,
  DateNum,
  SubsectionHeading,
};
