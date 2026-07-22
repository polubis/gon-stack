import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Main } from '../presentation/main';
import { Provider } from '../presentation/context';
import { server } from '@/__tests__/mock-server';
import { http, HttpResponse } from 'msw';
import type { Schema } from '@/shared/server-contracts/schemas/get-user-profile-questions';
import type { InferOut } from '@/shared/server-contracts/extraction';

describe('User profile setup works when', () => {
  beforeEach(() => {
    server.use(
      http.get('/api/config/user-profile', () =>
        HttpResponse.json<InferOut<Schema['out'], 200>>({
          code: 200,
          groups: [
            {
              id: 1,
              key: 'basics',
              label: 'Basics',
              description: 'Tell us about you',
              questions: [
                {
                  id: 1,
                  key: 'display-name',
                  label: 'How should we call you?',
                  category: 'identity',
                  type: 'text',
                  constraints: { min: 1, max: 40, required: true },
                  value: '',
                },
              ],
            },
          ],
        }),
      ),
    );
  });

  it('displays welcome screen', () => {
    const { asFragment } = render(
      <Provider>
        <Main />
      </Provider>,
    );
    expect(asFragment()).toMatchSnapshot();
  });

  it('loads config from mocked backend and opens first step', async () => {
    const user = userEvent.setup();

    render(
      <Provider>
        <Main />
      </Provider>,
    );

    await user.click(screen.getByRole('button', { name: /let's go/i }));

    await screen.findByRole('heading', { name: 'Basics' });
    screen.getByText('Tell us about you');
    screen.getByText('How should we call you?');
  });

  it('keeps age value between 18 and 120', async () => {
    const user = userEvent.setup();

    server.use(
      http.get('/api/config/user-profile', () =>
        HttpResponse.json<InferOut<Schema['out'], 200>>({
          code: 200,
          groups: [
            {
              id: 1,
              key: 'basics',
              label: 'Basics',
              description: 'Tell us about you',
              questions: [
                {
                  id: 1,
                  key: 'display-name',
                  label: 'How should we call you?',
                  category: 'identity',
                  type: 'text',
                  constraints: { min: 1, max: 40, required: true },
                  value: '',
                },
                {
                  id: 2,
                  key: 'age',
                  label: 'Age',
                  category: 'identity',
                  type: 'numeric',
                  constraints: { min: 18, max: 120, required: true },
                  value: 18,
                },
              ],
            },
          ],
        }),
      ),
    );

    render(
      <Provider>
        <Main />
      </Provider>,
    );

    await user.click(screen.getByRole('button', { name: /let's go/i }));

    const ageInput = await screen.findByRole('spinbutton');

    fireEvent.change(ageInput, { target: { value: '10' } });
    expect(ageInput).toHaveValue(18);

    fireEvent.change(ageInput, { target: { value: '130' } });
    expect(ageInput).toHaveValue(120);
  });

  it('finishes full flow and disables continue after back when a required answer is invalid', async () => {
    const user = userEvent.setup();

    server.use(
      http.get('/api/config/user-profile', () =>
        HttpResponse.json<InferOut<Schema['out'], 200>>({
          code: 200,
          groups: [
            {
              id: 1,
              key: 'step-one',
              label: 'Step One',
              description: 'First step description',
              questions: [
                {
                  id: 1,
                  key: 'nickname',
                  label: 'Nickname',
                  category: 'Step One',
                  type: 'text',
                  constraints: { min: 1, max: 30, required: true },
                  value: '',
                },
                {
                  id: 2,
                  key: 'age',
                  label: 'Age',
                  category: 'Step One',
                  type: 'numeric',
                  constraints: { min: 18, max: 120, required: true },
                  value: 18,
                },
              ],
            },
            {
              id: 2,
              key: 'step-two',
              label: 'Step Two',
              description: 'Second step description',
              questions: [
                {
                  id: 3,
                  key: 'about_me',
                  label: 'About me',
                  category: 'Step Two',
                  type: 'text',
                  constraints: { min: 0, max: 120, required: false },
                  value: '',
                },
              ],
            },
          ],
        }),
      ),
    );

    render(
      <Provider>
        <Main />
      </Provider>,
    );

    await user.click(screen.getByRole('button', { name: /let's go/i }));

    const answerInput = await screen.findByPlaceholderText('Your answer');
    await user.type(answerInput, 'Alice');
    await user.click(screen.getByRole('button', { name: 'Continue' }));

    const secondStepInput = await screen.findByPlaceholderText('Your answer');
    await user.type(secondStepInput, 'About me text');
    await user.click(screen.getByRole('button', { name: 'Continue' }));

    await screen.findByText("Here's your romantic vibe");

    await user.click(screen.getByRole('button', { name: 'Edit answers' }));
    await screen.findByRole('heading', { name: 'Step One' });

    const firstStepInput = await screen.findByPlaceholderText('Your answer');
    await user.clear(firstStepInput);
    expect(screen.getByRole('button', { name: 'Continue' })).toBeDisabled();
  });

  it('shows error when config fetch fails and recovers on retry', async () => {
    const user = userEvent.setup();
    let requests = 0;

    server.use(
      http.get('/api/config/user-profile', () => {
        requests += 1;

        if (requests === 1) {
          return new HttpResponse(null, { status: 500 });
        }

        return HttpResponse.json<InferOut<Schema['out'], 200>>({
          code: 200,
          groups: [
            {
              id: 1,
              key: 'basics',
              label: 'Basics',
              description: 'Tell us about you',
              questions: [
                {
                  id: 1,
                  key: 'display-name',
                  label: 'How should we call you?',
                  category: 'identity',
                  type: 'text',
                  constraints: { min: 1, max: 40, required: true },
                  value: '',
                },
              ],
            },
          ],
        });
      }),
    );

    render(
      <Provider>
        <Main />
      </Provider>,
    );

    await screen.findByText("We couldn't load your profile setup");
    screen.getByText('Failed to fetch config');

    await user.click(screen.getByRole('button', { name: 'Retry' }));

    await screen.findByRole('button', { name: /let's go/i });
    expect(screen.getByRole('button', { name: /let's go/i })).toBeEnabled();
  });

  it('navigates back to previous step with answers preserved', async () => {
    const user = userEvent.setup();

    server.use(
      http.get('/api/config/user-profile', () =>
        HttpResponse.json<InferOut<Schema['out'], 200>>({
          code: 200,
          groups: [
            {
              id: 1,
              key: 'step-one',
              label: 'Step One',
              description: 'First step description',
              questions: [
                {
                  id: 1,
                  key: 'nickname',
                  label: 'Nickname',
                  category: 'Step One',
                  type: 'text',
                  constraints: { min: 1, max: 30, required: true },
                  value: '',
                },
              ],
            },
            {
              id: 2,
              key: 'step-two',
              label: 'Step Two',
              description: 'Second step description',
              questions: [
                {
                  id: 2,
                  key: 'about_me',
                  label: 'About me',
                  category: 'Step Two',
                  type: 'text',
                  constraints: { min: 0, max: 120, required: false },
                  value: '',
                },
              ],
            },
          ],
        }),
      ),
    );

    render(
      <Provider>
        <Main />
      </Provider>,
    );

    await user.click(screen.getByRole('button', { name: /let's go/i }));

    const firstStepInput = await screen.findByPlaceholderText('Your answer');
    await user.type(firstStepInput, 'Alice');
    await user.click(screen.getByRole('button', { name: 'Continue' }));

    await screen.findByText('Step 2 of 2 - Step Two');

    await user.click(screen.getByRole('button', { name: 'Back' }));

    await screen.findByText('Step 1 of 2 - Step One');
    expect(await screen.findByPlaceholderText('Your answer')).toHaveValue(
      'Alice',
    );
  });

  it('changes numeric value with increase and decrease buttons', async () => {
    const user = userEvent.setup();

    server.use(
      http.get('/api/config/user-profile', () =>
        HttpResponse.json<InferOut<Schema['out'], 200>>({
          code: 200,
          groups: [
            {
              id: 1,
              key: 'basics',
              label: 'Basics',
              description: 'Tell us about you',
              questions: [
                {
                  id: 1,
                  key: 'age',
                  label: 'Age',
                  category: 'identity',
                  type: 'numeric',
                  constraints: { min: 18, max: 120, required: true },
                  value: 18,
                },
              ],
            },
          ],
        }),
      ),
    );

    render(
      <Provider>
        <Main />
      </Provider>,
    );

    await user.click(screen.getByRole('button', { name: /let's go/i }));

    const ageInput = await screen.findByRole('spinbutton');
    expect(ageInput).toHaveValue(18);

    await user.click(screen.getByRole('button', { name: 'Increase value' }));
    expect(ageInput).toHaveValue(19);

    await user.click(screen.getByRole('button', { name: 'Decrease value' }));
    expect(ageInput).toHaveValue(18);
  });

  it('continues through select question and shows chosen label in summary', async () => {
    const user = userEvent.setup();

    server.use(
      http.get('/api/config/user-profile', () =>
        HttpResponse.json<InferOut<Schema['out'], 200>>({
          code: 200,
          groups: [
            {
              id: 1,
              key: 'style',
              label: 'Style',
              description: 'Pick your vibe',
              questions: [
                {
                  id: 1,
                  key: 'vibe',
                  label: 'Pick a vibe',
                  category: 'Style',
                  type: 'select',
                  constraints: { min: 0, max: 0, required: true },
                  options: [
                    { value: 'warm', label: 'Warm' },
                    { value: 'cool', label: 'Cool' },
                  ],
                  value: '',
                },
              ],
            },
          ],
        }),
      ),
    );

    render(
      <Provider>
        <Main />
      </Provider>,
    );

    await user.click(screen.getByRole('button', { name: /let's go/i }));

    expect(screen.getByRole('button', { name: 'Continue' })).toBeDisabled();

    await user.click(screen.getByRole('button', { name: 'Warm' }));
    await user.click(screen.getByRole('button', { name: 'Continue' }));

    await screen.findByText("Here's your romantic vibe");
    screen.getByText('Warm');
  });

  it('continues through slide question with default value', async () => {
    const user = userEvent.setup();

    server.use(
      http.get('/api/config/user-profile', () =>
        HttpResponse.json<InferOut<Schema['out'], 200>>({
          code: 200,
          groups: [
            {
              id: 1,
              key: 'comfort',
              label: 'Comfort',
              description: 'How cozy do you feel?',
              questions: [
                {
                  id: 1,
                  key: 'coziness',
                  label: 'Coziness',
                  category: 'Comfort',
                  type: 'slide',
                  constraints: { min: 1, max: 10, required: true },
                  badges: { min: 'Low', max: 'High' },
                  value: 5,
                },
              ],
            },
          ],
        }),
      ),
    );

    render(
      <Provider>
        <Main />
      </Provider>,
    );

    await user.click(screen.getByRole('button', { name: /let's go/i }));

    await screen.findByText('How cozy do you feel?');
    screen.getByRole('slider');
    await user.click(screen.getByRole('button', { name: 'Continue' }));

    await screen.findByText("Here's your romantic vibe");
    screen.getByText('5');
  });

  it('saves profile answers and shows success message', async () => {
    const user = userEvent.setup();

    server.use(
      http.get('/api/config/user-profile', () =>
        HttpResponse.json<InferOut<Schema['out'], 200>>({
          code: 200,
          groups: [
            {
              id: 1,
              key: 'step-one',
              label: 'Step One',
              description: 'First step description',
              questions: [
                {
                  id: 1,
                  key: 'nickname',
                  label: 'Nickname',
                  category: 'Step One',
                  type: 'text',
                  constraints: { min: 1, max: 30, required: true },
                  value: '',
                },
              ],
            },
          ],
        }),
      ),
      http.post('/api/user-profile/save-answers', async ({ request }) => {
        await expect(request.json()).resolves.toEqual({
          answers: { nickname: 'Alice' },
        });

        return HttpResponse.json({ code: 200, ok: true });
      }),
    );

    render(
      <Provider>
        <Main />
      </Provider>,
    );

    await user.click(screen.getByRole('button', { name: /let's go/i }));

    const answerInput = await screen.findByPlaceholderText('Your answer');
    await user.type(answerInput, 'Alice');
    await user.click(screen.getByRole('button', { name: 'Continue' }));

    await screen.findByText("Here's your romantic vibe");
    await user.click(
      screen.getByRole('button', { name: 'Save profile & start playing' }),
    );

    await screen.findByText('Profile saved. You are ready to start playing.');
  });
});
