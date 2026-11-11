import type { Ctx } from '@/__e2e__/test';

/** Locators shared by the time e2e specs; every one resolves through typed `data-e2e` ids. */

type Prefixer = Ctx['getByE2ePrefix'];

const taskRow = (prefix: Prefixer, title: string) =>
  prefix('time:task:').filter({ hasText: title });
export const taskEdit = (prefix: Prefixer, title: string) =>
  prefix('time:task-edit:', taskRow(prefix, title));
export const taskInfo = (prefix: Prefixer, title: string) =>
  prefix('time:task-info:', taskRow(prefix, title));
export const taskMore = (prefix: Prefixer, title: string) =>
  prefix('time:task-more:', taskRow(prefix, title));
export const taskDone = (prefix: Prefixer, title: string) =>
  prefix('time:task-done:', taskRow(prefix, title));
// The task menu is a portal: its single open instance is searched page-wide.
export const taskDelete = (prefix: Prefixer) => prefix('time:task-delete:');
export const moveItem = (prefix: Prefixer, text: string) =>
  prefix('time:task-move:').filter({ hasText: text });

const attachmentRow = (prefix: Prefixer, name: string) =>
  prefix('time:attachment:').filter({ hasText: name });
export const attachmentLink = (prefix: Prefixer, name: string) =>
  prefix('time:attachment-link:', attachmentRow(prefix, name));
export const attachmentThumb = (prefix: Prefixer, name: string) =>
  prefix('time:attachment-thumb:', attachmentRow(prefix, name));
export const attachmentDelete = (prefix: Prefixer, name: string) =>
  prefix('time:attachment-delete:', attachmentRow(prefix, name));

export const commentEdit = (prefix: Prefixer, author: string) =>
  prefix(
    'time:comment-edit:',
    prefix('time:comment:').filter({ hasText: author }),
  );
