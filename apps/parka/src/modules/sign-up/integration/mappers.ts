import type { Schema } from '@schemas/register-user';
import type { SignUpResult } from '../domain/models';
import { MESSAGES } from '../configuration/constraints';

export const toSignUpResult = (dto: Schema['out']): SignUpResult =>
  dto.code === 200
    ? { status: 'pending-confirmation' }
    : {
        status: 'rejected',
        message: 'message' in dto ? dto.message : MESSAGES.rejectedFallback,
      };
