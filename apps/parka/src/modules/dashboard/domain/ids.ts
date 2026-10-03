import type { LimitId } from './models';

const randomPart = (): string => crypto.randomUUID();

export const newLimitId = (): LimitId => `limit-${randomPart()}` as LimitId;
