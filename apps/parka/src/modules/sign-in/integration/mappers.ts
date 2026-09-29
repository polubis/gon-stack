import type { Schema } from '@schemas/login-user';
import type { SignInResult } from '../domain/models';
import { MESSAGES } from '../configuration/constraints';

export const toSignInResult = (dto: Schema['out']): SignInResult => ({
  status: 'rejected',
  message: 'message' in dto ? dto.message : MESSAGES.rejectedFallback,
});
