import type { Ctx } from '@/__e2e__/test';

/** Locators shared by the knowledge e2e specs; every one resolves through typed `data-e2e` ids. */

type Prefixer = Ctx['getByE2ePrefix'];

export const topicRow = (prefix: Prefixer, title: string) =>
  prefix('knowledge:topic:').filter({ hasText: title });
export const topicToggle = (prefix: Prefixer, title: string) =>
  prefix('knowledge:topic-toggle:', topicRow(prefix, title));
export const topicPlay = (prefix: Prefixer, title: string) =>
  prefix('knowledge:topic-play:', topicRow(prefix, title));
export const topicReels = (prefix: Prefixer, title: string) =>
  prefix('knowledge:topic-reels:', topicRow(prefix, title));
export const reelUpload = (prefix: Prefixer) =>
  prefix('knowledge:reel-upload:').first();
export const reelMedia = (prefix: Prefixer) =>
  prefix('knowledge:reel-media:').first();
