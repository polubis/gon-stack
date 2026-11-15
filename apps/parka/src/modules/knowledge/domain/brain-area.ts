/** Regions of the brain a folder of knowledge can point at (side view, face to the left). */
export const BRAIN_AREA_IDS = [
  'frontal',
  'parietal',
  'temporal',
  'occipital',
  'cerebellum',
  'brainstem',
] as const;

export type BrainAreaId = (typeof BRAIN_AREA_IDS)[number];

export type BrainArea = {
  id: BrainAreaId;
  /** Polish name shown in the UI. */
  name: string;
  /** What the region does: the hint of a folder. */
  role: string;
};

export const BRAIN_AREAS: readonly BrainArea[] = [
  { id: 'frontal', name: 'Płat czołowy', role: 'Planowanie i decyzje' },
  { id: 'parietal', name: 'Płat ciemieniowy', role: 'Logika i przestrzeń' },
  { id: 'temporal', name: 'Płat skroniowy', role: 'Język i pamięć' },
  { id: 'occipital', name: 'Płat potyliczny', role: 'Wzrok i obrazy' },
  { id: 'cerebellum', name: 'Móżdżek', role: 'Umiejętności i rutyna' },
  { id: 'brainstem', name: 'Pień mózgu', role: 'Nawyki i energia' },
];

export const areaName = (id: BrainAreaId): string =>
  BRAIN_AREAS.find((area) => area.id === id)?.name ?? id;
