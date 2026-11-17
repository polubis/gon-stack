export type UiE2eId =
  | 'ui:error-retry'
  | 'ui:empty-icon'
  | 'ui:empty-title'
  | 'ui:empty-description'
  | 'ui:scope-dialog'
  | 'ui:scope-confirm'
  | 'ui:scope-cancel'
  | `ui:scope:${'all' | 'this' | 'thisAndFollowing' | 'following'}`
  | `ui:option:${string}`;
