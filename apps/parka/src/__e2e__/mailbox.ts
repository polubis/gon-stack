import { expect, type Page } from '@playwright/test';
import { APP_ROUTER } from '@/shared/router';

/** Local Supabase mail server (Mailpit) web/API port from `supabase/config.toml`. */
const MAILBOX_URL = 'http://localhost:54324';
const CONFIRM_LINK = /https?:\/\/[^\s"<>]+\/auth\/v1\/verify\?[^\s"<>]+/;

type Message = { ID: string };

const findConfirmLink = async (
  page: Page,
  email: string,
): Promise<string | null> => {
  const search = await page.request.get(
    `${MAILBOX_URL}/api/v1/search?query=${encodeURIComponent(`to:${email}`)}`,
  );
  if (!search.ok()) return null;

  const { messages } = (await search.json()) as { messages: Message[] };
  if (!messages.length) return null;

  const message = await page.request.get(
    `${MAILBOX_URL}/api/v1/message/${messages[0]!.ID}`,
  );
  const { Text } = (await message.json()) as { Text: string };
  return CONFIRM_LINK.exec(Text)?.[0] ?? null;
};

/**
 * Registers `email` through the sign-up form, then follows the confirmation
 * link from the local mailbox in the same browser context (the PKCE verifier
 * cookie lives there) so the session lands on `/app/`.
 */
export const registerAndConfirm = async (
  page: Page,
  email: string,
  password: string,
): Promise<void> => {
  await page.goto(APP_ROUTER.signUp());
  await page.waitForLoadState('networkidle');
  await page.getByTestId('auth:email').fill(email);
  await page.getByTestId('auth:password').fill(password);
  await page.getByTestId('auth:submit').click();
  await expect(page.getByRole('status')).toContainText(
    /potwierdź rejestrację/i,
  );

  let link: string | null = null;
  await expect
    .poll(async () => (link = await findConfirmLink(page, email)), {
      message: `confirmation email for ${email}`,
      timeout: 10_000,
    })
    .not.toBeNull();

  await page.goto(link!);
  await page.waitForURL(`**${APP_ROUTER.dashboard()}`);
};
