import { createLucideIcon } from 'lucide-react';

export const FacebookIcon = createLucideIcon('Facebook', [
  [
    'path',
    {
      d: 'M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z',
      key: 'facebook-path',
    },
  ],
]);

export const InstagramIcon = createLucideIcon('Instagram', [
  [
    'rect',
    {
      width: '20',
      height: '20',
      x: '2',
      y: '2',
      rx: '5',
      ry: '5',
      key: 'instagram-rect',
    },
  ],
  [
    'path',
    {
      d: 'M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z',
      key: 'instagram-path',
    },
  ],
  [
    'line',
    {
      x1: '17.5',
      x2: '17.51',
      y1: '6.5',
      y2: '6.5',
      key: 'instagram-line',
    },
  ],
]);

export const LinkedinIcon = createLucideIcon('Linkedin', [
  [
    'path',
    {
      d: 'M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z',
      key: 'linkedin-path',
    },
  ],
  ['rect', { width: '4', height: '12', x: '2', y: '9', key: 'linkedin-rect' }],
  ['circle', { cx: '4', cy: '4', r: '2', key: 'linkedin-circle' }],
]);

export const YoutubeIcon = createLucideIcon('Youtube', [
  [
    'path',
    {
      d: 'M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.56 49.56 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24.12 24.12 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.55 49.55 0 0 1-16.2 0A2 2 0 0 1 2.5 17',
      key: 'youtube-path',
    },
  ],
  ['path', { d: 'm10 15 5-3-5-3z', key: 'youtube-triangle' }],
]);
