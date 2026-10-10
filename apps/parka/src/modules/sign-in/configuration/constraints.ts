export const FEATURE_NAME = 'SignIn';

export const ERROR_CODES = {
  render: 'SIGN_IN_RENDER',
} as const;

export const MESSAGES = {
  invalidInput: 'Enter a valid email and password (min. 6 characters).',
  rejectedFallback: 'Sign-in failed. Try again.',
} as const;
