import type { Credentials, Email, Password } from '../domain/models';
import { MESSAGES } from '../configuration/constraints';

const MIN_PASSWORD_LENGTH = 6;

export const selectCredentials = (
  email: string,
  password: string,
): Credentials | null =>
  email.includes('@') && password.length >= MIN_PASSWORD_LENGTH
    ? { email: email as Email, password: password as Password }
    : null;

export const selectErrorMessage = (
  invalidInput: boolean,
  submitError: string | null,
): string | null => (invalidInput ? MESSAGES.invalidInput : submitError);
