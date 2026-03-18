import { setupServer } from 'msw/node';
import { http, HttpResponse } from 'msw';

export const backendFixture = ({ beforeAll, afterAll, afterEach }) => {
  const server = setupServer();

  beforeAll(() => {
    server.listen();
  });

  afterEach(() => {
    server.resetHandlers();
  });

  afterAll(() => {
    server.close();
  });

  const mock = () =>
    server.use(
      http.get('/api/config/user-profile', () =>
        HttpResponse.json({
          groups: [
            {
              id: 1,
              key: 'basics',
              label: 'Basics',
              description: 'Tell us about you',
              questions: [
                {
                  id: 1,
                  key: 'user-profile.display-name',
                  question: 'How should we call you?',
                  category: 'identity',
                  type: 'text',
                  constraints: { min: 1, max: 40, required: true },
                },
              ],
            },
          ],
        }),
      ),
    );

  return mock;
};
