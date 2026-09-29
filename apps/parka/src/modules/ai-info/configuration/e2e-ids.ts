export const AI_INFO_E2E_IDS = ['ai-info:main', 'ai-info:steps'] as const;

export type AiInfoE2eId = (typeof AI_INFO_E2E_IDS)[number];
