import { expect, test, type Page } from '@playwright/test';
import { interpreter } from '@repo/vibe-test';

const mockConfigResponse = {
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
          constraints: {
            min: 1,
            max: 30,
            required: true,
          },
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
          constraints: {
            min: 0,
            max: 120,
            required: false,
          },
          value: '',
        },
      ],
    },
  ],
} as const;

const singleStepConfigResponse = {
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
          constraints: {
            min: 1,
            max: 30,
            required: true,
          },
          value: '',
        },
      ],
    },
  ],
} as const;

const ageConfigResponse = {
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
          constraints: {
            min: 18,
            max: 120,
            required: true,
          },
          value: 18,
        },
      ],
    },
  ],
} as const;

const selectConfigResponse = {
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
          constraints: {
            min: 0,
            max: 0,
            required: true,
          },
          options: [
            { value: 'warm', label: 'Warm' },
            { value: 'cool', label: 'Cool' },
          ],
          value: '',
        },
      ],
    },
  ],
} as const;

const slideConfigResponse = {
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
          constraints: {
            min: 1,
            max: 10,
            required: true,
          },
          badges: {
            min: 'Low',
            max: 'High',
          },
          value: 5,
        },
      ],
    },
  ],
} as const;

const configFailureStateByPage = new WeakMap<Page, { shouldFail: boolean }>();

const commands = {
  'mock user profile config': (page: Page) =>
    page.route('**/api/config/user-profile', (route) =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(mockConfigResponse),
      }),
    ),
  'mock user profile config with single step': (page: Page) =>
    page.route('**/api/config/user-profile', (route) =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(singleStepConfigResponse),
      }),
    ),
  'mock user profile config with age question': (page: Page) =>
    page.route('**/api/config/user-profile', (route) =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(ageConfigResponse),
      }),
    ),
  'mock user profile config with select question': (page: Page) =>
    page.route('**/api/config/user-profile', (route) =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(selectConfigResponse),
      }),
    ),
  'mock user profile config with slide question': (page: Page) =>
    page.route('**/api/config/user-profile', (route) =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(slideConfigResponse),
      }),
    ),
  'mock user profile config failing until retry': (page: Page) => {
    configFailureStateByPage.set(page, { shouldFail: true });

    return page.route('**/api/config/user-profile', (route) => {
      const state = configFailureStateByPage.get(page);

      if (state?.shouldFail) {
        return route.fulfill({ status: 500, body: '' });
      }

      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(singleStepConfigResponse),
      });
    });
  },
  'enable user profile config loading': (page: Page) => {
    configFailureStateByPage.get(page)!.shouldFail = false;
  },
  'mock user profile save answers endpoint': (page: Page) =>
    page.route('**/api/user-profile/save-answers', (route) =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ ok: true }),
      }),
    ),
  'im on user profile setup page': (page: Page) =>
    page.goto('/user-profile-setup'),
  'i click start profile setup button': (page: Page) =>
    page.getByRole('button', { name: "Let's go" }).click(),
  'i complete first step and continue': async (page: Page) => {
    await page.getByPlaceholder('Your answer').first().fill('Alice');
    await page.getByRole('button', { name: 'Continue' }).click();
  },
  'i complete second step and continue': async (page: Page) => {
    await page.getByPlaceholder('Your answer').first().fill('I like sunsets');
    await page.getByRole('button', { name: 'Continue' }).click();
  },
  'i click back on current step': (page: Page) =>
    page.getByRole('button', { name: 'Back' }).click(),
  'i click continue on current step': (page: Page) =>
    page.getByRole('button', { name: 'Continue' }).click(),
  'i click retry loading profile setup': (page: Page) =>
    page.getByRole('button', { name: 'Retry' }).click(),
  'i click increase age value': (page: Page) =>
    page.getByRole('button', { name: 'Increase value' }).click(),
  'i click decrease age value': (page: Page) =>
    page.getByRole('button', { name: 'Decrease value' }).click(),
  'i select warm vibe option': (page: Page) =>
    page.getByRole('button', { name: 'Warm' }).click(),
  'i click save profile button': (page: Page) =>
    page.getByRole('button', { name: 'Save profile & start playing' }).click(),
  'i clear first step answer': async (page: Page) => {
    await page.getByPlaceholder('Your answer').first().clear();
  },
  'i fill age input with 10': async (page: Page) => {
    await page.getByRole('spinbutton').fill('10');
  },
  'i fill age input with 130': async (page: Page) => {
    await page.getByRole('spinbutton').fill('130');
  },
  'i should see second step text': (page: Page) =>
    expect(page.getByText('Step 2 of 2 - Step Two')).toBeVisible(),
  'i should see first step text': (page: Page) =>
    expect(page.getByText('Step 1 of 2 - Step One')).toBeVisible(),
  'i should see results screen': (page: Page) =>
    expect(page.getByText("Here's your romantic vibe")).toBeVisible(),
  'i should see profile setup error': (page: Page) =>
    expect(page.getByText("We couldn't load your profile setup")).toBeVisible(),
  'i should see enabled start button': (page: Page) =>
    expect(page.getByRole('button', { name: "Let's go" })).toBeEnabled(),
  'i should see age input with value 18': (page: Page) =>
    expect(page.getByRole('spinbutton')).toHaveValue('18'),
  'i should see age input with value 19': (page: Page) =>
    expect(page.getByRole('spinbutton')).toHaveValue('19'),
  'i should see age input with value 120': (page: Page) =>
    expect(page.getByRole('spinbutton')).toHaveValue('120'),
  'i should see continue disabled on step': (page: Page) =>
    expect(page.getByRole('button', { name: 'Continue' })).toBeDisabled(),
  'i should see warm in summary': (page: Page) =>
    expect(page.getByText('Warm')).toBeVisible(),
  'i should see coziness value in summary': (page: Page) =>
    expect(page.getByText('5')).toBeVisible(),
  'i should see profile saved message': (page: Page) =>
    expect(
      page.getByText('Profile saved. You are ready to start playing.'),
    ).toBeVisible(),
  'i go back to edit answers': async (page: Page) => {
    await page.getByRole('button', { name: 'Edit answers' }).click();
    await expect(page.getByRole('heading', { name: 'Step One' })).toBeVisible();
  },
  'i should see first step answer prefilled as Alice': (page: Page) =>
    expect(page.getByPlaceholder('Your answer').first()).toHaveValue('Alice'),
  'i update first step answer and continue': async (page: Page) => {
    await page.getByPlaceholder('Your answer').first().fill('Bob');
    await page.getByRole('button', { name: 'Continue' }).click();
  },
  'i should see second step answer prefilled': (page: Page) =>
    expect(page.getByPlaceholder('Your answer').first()).toHaveValue(
      'I like sunsets',
    ),
  'i reload page': (page: Page) => page.reload(),
  'i should be back on start screen': (page: Page) =>
    expect(page.getByRole('button', { name: "Let's go" })).toBeVisible(),
};

test('user profile setup goes to second step', async ({ page }) => {
  await interpreter(commands)(
    ['mock user profile config', page],
    ['im on user profile setup page', page],
    ['i click start profile setup button', page],
    ['i complete first step and continue', page],
    ['i should see second step text', page],
  );
});

test('user can finish flow, go back, edit answers, and refresh resets to start', async ({
  page,
}) => {
  await interpreter(commands)(
    ['mock user profile config', page],
    ['im on user profile setup page', page],
    ['i click start profile setup button', page],
    ['i complete first step and continue', page],
    ['i should see second step text', page],
    ['i complete second step and continue', page],
    ['i should see results screen', page],
    ['i go back to edit answers', page],
    ['i should see first step answer prefilled as Alice', page],
    ['i update first step answer and continue', page],
    ['i should see second step answer prefilled', page],
    ['i reload page', page],
    ['i should be back on start screen', page],
  );
});

test('user profile setup shows error and recovers on retry', async ({
  page,
}) => {
  await interpreter(commands)(
    ['mock user profile config failing until retry', page],
    ['im on user profile setup page', page],
    ['i should see profile setup error', page],
    ['enable user profile config loading', page],
    ['i click retry loading profile setup', page],
    ['i should see enabled start button', page],
  );
});

test('user can go back to previous step with answers preserved', async ({
  page,
}) => {
  await interpreter(commands)(
    ['mock user profile config', page],
    ['im on user profile setup page', page],
    ['i click start profile setup button', page],
    ['i complete first step and continue', page],
    ['i should see second step text', page],
    ['i click back on current step', page],
    ['i should see first step text', page],
    ['i should see first step answer prefilled as Alice', page],
  );
});

test('user profile setup keeps age between 18 and 120', async ({ page }) => {
  await interpreter(commands)(
    ['mock user profile config with age question', page],
    ['im on user profile setup page', page],
    ['i click start profile setup button', page],
    ['i should see age input with value 18', page],
    ['i fill age input with 10', page],
    ['i should see age input with value 18', page],
    ['i fill age input with 130', page],
    ['i should see age input with value 120', page],
  );
});

test('user can change age with increase and decrease buttons', async ({
  page,
}) => {
  await interpreter(commands)(
    ['mock user profile config with age question', page],
    ['im on user profile setup page', page],
    ['i click start profile setup button', page],
    ['i should see age input with value 18', page],
    ['i click increase age value', page],
    ['i should see age input with value 19', page],
    ['i click decrease age value', page],
    ['i should see age input with value 18', page],
  );
});

test('user can complete select question and see label in summary', async ({
  page,
}) => {
  await interpreter(commands)(
    ['mock user profile config with select question', page],
    ['im on user profile setup page', page],
    ['i click start profile setup button', page],
    ['i should see continue disabled on step', page],
    ['i select warm vibe option', page],
    ['i click continue on current step', page],
    ['i should see results screen', page],
    ['i should see warm in summary', page],
  );
});

test('user can complete slide question with default value', async ({
  page,
}) => {
  await interpreter(commands)(
    ['mock user profile config with slide question', page],
    ['im on user profile setup page', page],
    ['i click start profile setup button', page],
    ['i click continue on current step', page],
    ['i should see results screen', page],
    ['i should see coziness value in summary', page],
  );
});

test('user can save profile answers and see success message', async ({
  page,
}) => {
  await interpreter(commands)(
    ['mock user profile config with single step', page],
    ['mock user profile save answers endpoint', page],
    ['im on user profile setup page', page],
    ['i click start profile setup button', page],
    ['i complete first step and continue', page],
    ['i should see results screen', page],
    ['i click save profile button', page],
    ['i should see profile saved message', page],
  );
});

test('user cannot continue when required answer is cleared after edit', async ({
  page,
}) => {
  await interpreter(commands)(
    ['mock user profile config with single step', page],
    ['im on user profile setup page', page],
    ['i click start profile setup button', page],
    ['i complete first step and continue', page],
    ['i should see results screen', page],
    ['i go back to edit answers', page],
    ['i clear first step answer', page],
    ['i should see continue disabled on step', page],
  );
});
