export type DictationE2eId =
  | 'dictation:preview'
  | 'dictation:toggle'
  | 'dictation:cancel'
  | 'dictation:insert'
  | `dictation:start:${string}`;
