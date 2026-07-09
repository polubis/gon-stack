import {
  type ComponentPropsWithoutRef,
  useEffect,
  useRef,
  useState,
} from 'react';

type CounterProps = ComponentPropsWithoutRef<'span'> & {
  value: number;
  duration?: number;
  decimals?: number;
  prefix?: string;
  suffix?: string;
};

const easeOutQuad = (progress: number) => progress * (2 - progress);

export const Counter = ({
  value,
  duration = 1800,
  decimals = 0,
  prefix = '',
  suffix = '',
  ...spanProps
}: CounterProps) => {
  const [display, setDisplay] = useState(0);
  const elementRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        observer.disconnect();

        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
          setDisplay(value);
          return;
        }

        const start = performance.now();

        const step = (now: number) => {
          const progress = Math.min((now - start) / duration, 1);
          setDisplay(value * easeOutQuad(progress));

          if (progress < 1) {
            requestAnimationFrame(step);
          }
        };

        requestAnimationFrame(step);
      },
      { threshold: 0.4 },
    );

    observer.observe(element);

    return () => observer.disconnect();
  }, [value, duration]);

  return (
    <span
      ref={elementRef}
      aria-label={`${prefix}${display.toFixed(decimals)}${suffix}`}
      {...spanProps}
    >
      {prefix}
      {display.toFixed(decimals)}
      {suffix}
    </span>
  );
};
