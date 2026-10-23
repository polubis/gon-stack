export const ACCESS_TOKENS_E2E_IDS = [
  'access-tokens:main',
  'access-tokens:add',
  'access-tokens:list',
  'access-tokens:empty',
  'access-tokens:endpoint',
  'access-tokens:load-error',
  'access-tokens:toast',
  'access-tokens:form',
  'access-tokens:name',
  'access-tokens:ttl',
  'access-tokens:submit',
  'access-tokens:secret-dialog',
  'access-tokens:secret',
  'access-tokens:secret-copy',
  'access-tokens:secret-done',
  'access-tokens:confirm-dialog',
  'access-tokens:confirm',
] as const;

export type AccessTokensE2eDynamicId =
  | `access-tokens:row:${string}`
  | `access-tokens:status:${string}`
  | `access-tokens:mask:${string}`
  | `access-tokens:last-used:${string}`
  | `access-tokens:rotate:${string}`
  | `access-tokens:revoke:${string}`
  | `access-tokens:delete:${string}`;

export type AccessTokensE2eId =
  (typeof ACCESS_TOKENS_E2E_IDS)[number] | AccessTokensE2eDynamicId;
