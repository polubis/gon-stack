import { cn } from '@repo/react-kit/cn';
import {
  useId,
  useSyncExternalStore,
  type ComponentProps,
  type KeyboardEvent,
} from 'react';
import {
  BRAIN_AREA_IDS,
  areaName,
  type BrainAreaId,
} from '../domain/brain-area';

const REDUCE = '(prefers-reduced-motion: reduce)';

const subscribe = (notify: () => void) => {
  const query = window.matchMedia?.(REDUCE);
  query?.addEventListener('change', notify);
  return () => query?.removeEventListener('change', notify);
};

const reduced = () => window.matchMedia?.(REDUCE).matches ?? false;

/** True when user asked for less motion; safe where matchMedia is missing. */
const useReducedMotion = (): boolean =>
  useSyncExternalStore(subscribe, reduced, () => true);

type Geometry = {
  /** Outer lobe outline, side view, face to the left. */
  outline: string;
  /** Sulci: faint grooves drawn inside the lobe. */
  sulci: readonly string[];
  /** Synapse sparks, lit once the liquid passes them. */
  sparks: readonly (readonly [number, number])[];
  top: number;
  bottom: number;
};

// ViewBox 320x260. Lobes share edges: central sulcus, lateral fissure,
// parieto-occipital sulcus; cerebellum and stem hang below.
const GEOMETRY: Record<BrainAreaId, Geometry> = {
  frontal: {
    outline:
      'M28 110C30 70 70 36 120 28C135 26 150 25 160 26C156 50 150 80 140 110C115 114 88 118 62 125C48 128 34 124 28 110Z',
    sulci: [
      'M48 72C70 62 92 60 112 66',
      'M40 96C62 84 90 82 118 90',
      'M100 40C110 56 122 70 128 92',
    ],
    sparks: [
      [52, 108],
      [78, 96],
      [104, 78],
      [124, 50],
      [68, 70],
      [96, 104],
    ],
    top: 25,
    bottom: 128,
  },
  parietal: {
    outline:
      'M160 26C190 24 225 30 250 42C248 65 245 88 240 110C228 106 216 102 205 98C183 102 162 106 140 110C150 80 156 50 160 26Z',
    sulci: ['M176 44C196 40 216 44 232 56', 'M166 74C190 70 212 76 230 88'],
    sparks: [
      [170, 60],
      [200, 50],
      [226, 70],
      [190, 90],
      [218, 94],
    ],
    top: 24,
    bottom: 110,
  },
  occipital: {
    outline:
      'M250 42C275 55 296 85 296 120C294 142 286 158 270 168C258 172 246 170 236 168C238 150 240 130 240 110C245 88 248 65 250 42Z',
    sulci: [
      'M256 70C272 84 280 104 278 128',
      'M250 110C262 122 266 140 262 156',
    ],
    sparks: [
      [262, 80],
      [282, 118],
      [258, 136],
      [272, 154],
    ],
    top: 42,
    bottom: 172,
  },
  temporal: {
    outline:
      'M62 125C88 118 115 114 140 110C162 106 183 102 205 98C216 102 228 106 240 110C240 130 238 150 236 168C200 182 150 184 110 178C85 172 66 152 62 125Z',
    sulci: [
      'M78 138C120 128 170 122 222 128',
      'M92 160C140 150 190 146 228 150',
    ],
    sparks: [
      [86, 142],
      [120, 162],
      [160, 136],
      [200, 160],
      [226, 140],
      [140, 174],
    ],
    top: 98,
    bottom: 184,
  },
  cerebellum: {
    outline:
      'M212 188C222 176 262 172 280 182C292 192 290 216 272 226C250 236 220 230 210 214C206 204 206 196 212 188Z',
    sulci: [
      'M222 190C244 186 264 188 280 196',
      'M218 206C240 202 262 204 282 212',
      'M222 220C242 218 258 220 272 224',
    ],
    sparks: [
      [232, 196],
      [262, 204],
      [240, 220],
    ],
    top: 174,
    bottom: 234,
  },
  brainstem: {
    outline:
      'M172 176C190 178 205 180 212 182C210 198 206 214 204 232C200 246 186 250 178 244C170 230 170 200 172 176Z',
    sulci: ['M186 186C190 206 188 224 190 240'],
    sparks: [
      [182, 194],
      [196, 216],
      [188, 236],
    ],
    top: 176,
    bottom: 248,
  },
};

// One sine period is 60 units; crest line then closed down past the viewBox.
const WAVE = 'M-120 0q15 -3 30 0' + 't30 0'.repeat(19) + 'V300H-120Z';

const clamp = (fill: number): number =>
  Number.isFinite(fill) ? Math.min(1, Math.max(0, fill)) : 0;

const percent = (fill: number): number => Math.round(clamp(fill) * 100);

export type BrainFillArea = {
  id: BrainAreaId;
  /** 0..1 how much of the area is filled with knowledge. */
  fill: number;
};

type BrainFillProps = Omit<ComponentProps<'figure'>, 'children'> & {
  /** Missing areas count as fill 0. */
  areas: readonly BrainFillArea[];
  /** 0..1 overall fill; defaults to the mean of the six areas. */
  total?: number;
  /** Lit area (hovered/focused folder); the rest dims a bit. */
  highlighted?: BrainAreaId | null;
  /** Click/Enter/Space on an area; absent = areas not interactive. */
  onSelectArea?: (id: BrainAreaId) => void;
};

export const BrainFill = ({
  areas,
  total: overall,
  highlighted = null,
  onSelectArea,
  className,
  ...props
}: BrainFillProps) => {
  const id = useId();
  const animate = !useReducedMotion();
  const fills = BRAIN_AREA_IDS.map((areaId) => ({
    id: areaId,
    name: areaName(areaId),
    fill: clamp(areas.find((area) => area.id === areaId)?.fill ?? 0),
  }));
  const total =
    overall === undefined
      ? Math.round(
          (fills.reduce((sum, area) => sum + area.fill, 0) / fills.length) *
            100,
        )
      : percent(overall);
  const label = `Mózg wypełniony wiedzą w ${total}%: ${fills
    .map((area) => `${area.name} ${percent(area.fill)}%`)
    .join(', ')}`;
  const interactive = Boolean(onSelectArea);
  const onKey = (areaId: BrainAreaId) => (event: KeyboardEvent) => {
    if (event.key !== 'Enter' && event.key !== ' ') return;
    event.preventDefault();
    onSelectArea?.(areaId);
  };

  return (
    <figure
      {...props}
      className={cn(
        'animate-item-in motion-reduce:animate-none w-full max-w-md',
        className,
      )}
    >
      <svg
        viewBox="0 0 320 260"
        className="block h-auto w-full overflow-visible"
        {...(interactive
          ? { role: 'group', 'aria-label': label }
          : { role: 'img', 'aria-label': label })}
      >
        <defs>
          {/* Liquid body: denser at the bottom. */}
          <linearGradient
            id={`${id}-liquid`}
            gradientUnits="userSpaceOnUse"
            x1="0"
            y1="20"
            x2="0"
            y2="250"
          >
            <stop offset="0" stopColor="var(--accent)" stopOpacity="0.55" />
            <stop offset="1" stopColor="var(--accent)" stopOpacity="0.95" />
          </linearGradient>
          {/* Empty track: faint ghost of the lobe. */}
          <linearGradient
            id={`${id}-track`}
            gradientUnits="userSpaceOnUse"
            x1="0"
            y1="20"
            x2="0"
            y2="250"
          >
            <stop offset="0" stopColor="var(--hero-track)" stopOpacity="0.9" />
            <stop offset="1" stopColor="var(--hero-track)" stopOpacity="0.3" />
          </linearGradient>
          {/* Top-left gloss over everything. */}
          <linearGradient
            id={`${id}-sheen`}
            gradientUnits="userSpaceOnUse"
            x1="40"
            y1="20"
            x2="260"
            y2="240"
          >
            <stop offset="0" stopColor="var(--on-hero)" stopOpacity="0.22" />
            <stop offset="0.45" stopColor="var(--on-hero)" stopOpacity="0" />
          </linearGradient>
          <filter
            id={`${id}-glow`}
            x="-20%"
            y="-20%"
            width="140%"
            height="140%"
          >
            <feGaussianBlur stdDeviation="4" />
          </filter>
          {BRAIN_AREA_IDS.map((areaId) => (
            <clipPath key={areaId} id={`${id}-${areaId}`}>
              <path d={GEOMETRY[areaId].outline} />
            </clipPath>
          ))}
        </defs>

        {fills.map((area) => {
          const geometry = GEOMETRY[area.id];
          const level =
            geometry.bottom - area.fill * (geometry.bottom - geometry.top);
          const lit = highlighted === area.id;
          const dim = highlighted !== null && !lit;
          const sparks = geometry.sparks.filter(([, y]) => y >= level);
          const areaLabel = `Obszar: ${area.name}, ${percent(area.fill)}% wypełnienia`;
          return (
            <g
              key={area.id}
              className={cn(
                'group transition-opacity duration-300 outline-none',
                dim && 'opacity-45',
                interactive && 'cursor-pointer',
              )}
              {...(interactive
                ? {
                    role: 'button',
                    tabIndex: 0,
                    'aria-label': areaLabel,
                    onClick: () => onSelectArea?.(area.id),
                    onKeyDown: onKey(area.id),
                  }
                : { 'aria-hidden': true })}
            >
              {/* Glow halo grows with fill. */}
              {area.fill > 0 && (
                <path
                  d={geometry.outline}
                  className="fill-accent"
                  opacity={0.15 + area.fill * 0.35}
                  filter={`url(#${id}-glow)`}
                />
              )}
              {/* Empty track. */}
              <path d={geometry.outline} fill={`url(#${id}-track)`} />
              <g clipPath={`url(#${id}-${area.id})`}>
                {/* Liquid with wavy crest; drifts sideways one period. */}
                <g transform={`translate(0 ${level})`}>
                  <g>
                    {animate && (
                      <animateTransform
                        attributeName="transform"
                        type="translate"
                        from="0 0"
                        to="-60 0"
                        dur="3.6s"
                        repeatCount="indefinite"
                      />
                    )}
                    <path d={WAVE} fill={`url(#${id}-liquid)`} />
                    <path
                      d={WAVE}
                      fill="none"
                      stroke="var(--accent)"
                      strokeWidth="1.5"
                      filter={`url(#${id}-glow)`}
                    />
                    <path
                      d={WAVE}
                      fill="none"
                      stroke="var(--on-hero)"
                      strokeOpacity="0.7"
                      strokeWidth="0.8"
                    />
                  </g>
                </g>
                {/* Synapse sparks and their links in the lit part. */}
                <g className="fill-on-hero stroke-on-hero">
                  {sparks.map(([x, y], index) => {
                    const next = sparks[index + 1];
                    return (
                      <g key={`${x}-${y}`}>
                        {next && (
                          <line
                            x1={x}
                            y1={y}
                            x2={next[0]}
                            y2={next[1]}
                            strokeWidth="0.6"
                            strokeOpacity="0.25"
                          />
                        )}
                        <circle cx={x} cy={y} r="1.3">
                          {animate && (
                            <animate
                              attributeName="opacity"
                              values="0.35;1;0.35"
                              dur="2.4s"
                              begin={`${(index * 0.7) % 2.4}s`}
                              repeatCount="indefinite"
                            />
                          )}
                        </circle>
                      </g>
                    );
                  })}
                </g>
                <path d={geometry.outline} fill={`url(#${id}-sheen)`} />
                <g
                  fill="none"
                  strokeWidth="1"
                  className="stroke-on-hero"
                  strokeOpacity="0.18"
                >
                  {geometry.sulci.map((sulcus) => (
                    <path key={sulcus} d={sulcus} />
                  ))}
                </g>
              </g>
              {/* Rim: hero line, accent when lit, focused or hovered. */}
              <path
                d={geometry.outline}
                fill="none"
                strokeWidth={lit ? 1.5 : 1}
                className={cn(
                  'stroke-hero-line transition-[stroke] duration-300',
                  lit && 'stroke-accent',
                  interactive &&
                    'group-focus-visible:stroke-accent group-hover:stroke-accent',
                )}
              />
            </g>
          );
        })}
      </svg>
      <figcaption className="sr-only">
        <ul>
          {fills.map((area) => (
            <li key={area.id}>
              {area.name}: {percent(area.fill)}%
            </li>
          ))}
        </ul>
      </figcaption>
    </figure>
  );
};
