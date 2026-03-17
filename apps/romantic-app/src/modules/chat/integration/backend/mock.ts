type MockConfig = {
  delayMs?: number;
  errorFactor?: number;
  error?: () => unknown;
};

const getRandomPercentage = (): number => Math.floor(Math.random() * 101);

export const mock =
  ({ delayMs = 160, errorFactor = 0, error }: MockConfig = {}) =>
  <Response>(response: Response) =>
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  <Payload>(payload?: Payload): Promise<Response> =>
    new Promise((resolve, reject) => {
      setTimeout(() => {
        if (getRandomPercentage() <= errorFactor) {
          reject(error?.() ?? new Error('Mock backend failure'));
          return;
        }

        resolve(response);
      }, delayMs);
    });
