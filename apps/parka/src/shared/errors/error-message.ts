/** The real message the failure carried (server `message`, network error text). */
export const errorMessage = (error: unknown): string =>
  error instanceof Error && error.message ? error.message : 'Unknown error';
