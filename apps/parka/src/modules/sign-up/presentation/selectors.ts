import type { Credentials, Email, Password } from '../domain/models';
import { ERROR_CODES, MESSAGES } from '../configuration/constraints';

const MIN_PASSWORD_LENGTH = 6;

export const selectCredentials = (
  email: string,
  password: string,
): Credentials | null =>
  email.includes('@') && password.length >= MIN_PASSWORD_LENGTH
    ? { email: email as Email, password: password as Password }
    : null;

export type FormErrorView = {
  title: string;
  code: string;
  description: string;
  retryable: boolean;
};

export const selectErrorMessage = (
  invalidInput: boolean,
  submitError: string | null,
): FormErrorView | null =>
  invalidInput
    ? {
        title: 'Popraw dane rejestracji',
        code: ERROR_CODES.invalidInput,
        description: MESSAGES.invalidInput,
        retryable: false,
      }
    : submitError
      ? {
          title: 'Nie udało się założyć konta',
          code: ERROR_CODES.rejected,
          description: submitError,
          retryable: true,
        }
      : null;
