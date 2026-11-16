import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it } from 'vitest';
import { CookieConsent } from '../presentation/cookie-consent';

const renderConsent = () =>
  render(<CookieConsent privacyPolicyUrl="/privacy" />);

const banner = () => screen.queryByRole('region', { name: 'We use cookies' });
const preferences = () =>
  screen.queryByRole('dialog', { name: 'Cookie preferences' });
const reopen = () => screen.queryByRole('button', { name: 'Cookie settings' });
const toggle = (name: string) => screen.getByRole('switch', { name });

describe('cookie consent', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it('asks for consent on the first visit', async () => {
    renderConsent();

    expect(
      await screen.findByRole('region', { name: 'We use cookies' }),
    ).toBeVisible();
    expect(
      screen.getByRole('link', { name: /privacy policy/i }),
    ).toHaveAttribute('href', '/privacy');
    expect(reopen()).not.toBeInTheDocument();
  });

  it('accepts all and offers the settings button instead of the banner', async () => {
    const user = userEvent.setup();
    renderConsent();

    await user.click(await screen.findByRole('button', { name: 'Accept all' }));

    expect(banner()).not.toBeInTheDocument();
    expect(screen.getByRole('status')).toHaveTextContent('Preferences saved');
    expect(reopen()).toBeVisible();
  });

  it('does not ask again after a reload once the choice is made', async () => {
    const user = userEvent.setup();
    const first = renderConsent();
    await user.click(
      await screen.findByRole('button', { name: 'Reject optional' }),
    );
    first.unmount();

    renderConsent();

    await waitFor(() => expect(reopen()).toBeVisible());
    expect(banner()).not.toBeInTheDocument();
  });

  it('hides the banner without saving a choice when dismissed', async () => {
    const user = userEvent.setup();
    const first = renderConsent();

    await user.click(
      await screen.findByRole('button', { name: 'Dismiss cookie notice' }),
    );

    expect(banner()).not.toBeInTheDocument();
    first.unmount();
    renderConsent();
    expect(
      await screen.findByRole('region', { name: 'We use cookies' }),
    ).toBeVisible();
  });

  it('keeps optional categories off in the preferences by default', async () => {
    const user = userEvent.setup();
    renderConsent();

    await user.click(
      await screen.findByRole('button', { name: 'Manage preferences' }),
    );

    expect(
      await screen.findByRole('dialog', { name: 'Cookie preferences' }),
    ).toBeVisible();
    expect(screen.getByText('Always active')).toBeVisible();
    for (const name of ['Analytics', 'Personalization', 'Marketing']) {
      expect(toggle(name)).toHaveAttribute('aria-checked', 'false');
    }
  });

  it('saves only the categories the user switched on', async () => {
    const user = userEvent.setup();
    const first = renderConsent();
    await user.click(
      await screen.findByRole('button', { name: 'Manage preferences' }),
    );

    await user.click(toggle('Analytics'));
    expect(toggle('Analytics')).toHaveAttribute('aria-checked', 'true');
    await user.click(screen.getByRole('button', { name: 'Save preferences' }));

    await waitFor(() => expect(preferences()).not.toBeInTheDocument());
    first.unmount();
    renderConsent();
    await user.click(
      await screen.findByRole('button', { name: 'Cookie settings' }),
    );
    expect(toggle('Analytics')).toHaveAttribute('aria-checked', 'true');
    expect(toggle('Marketing')).toHaveAttribute('aria-checked', 'false');
  });

  it('turns every optional category off when rejected from preferences', async () => {
    const user = userEvent.setup();
    const first = renderConsent();
    await user.click(await screen.findByRole('button', { name: 'Accept all' }));
    await user.click(
      await screen.findByRole('button', { name: 'Cookie settings' }),
    );
    expect(toggle('Marketing')).toHaveAttribute('aria-checked', 'true');

    await user.click(screen.getByRole('button', { name: 'Reject optional' }));

    await waitFor(() => expect(preferences()).not.toBeInTheDocument());
    first.unmount();
    renderConsent();
    await user.click(
      await screen.findByRole('button', { name: 'Cookie settings' }),
    );
    expect(toggle('Marketing')).toHaveAttribute('aria-checked', 'false');
  });

  it('drops unsaved toggles when the preferences are closed', async () => {
    const user = userEvent.setup();
    renderConsent();
    await user.click(
      await screen.findByRole('button', { name: 'Manage preferences' }),
    );
    await user.click(toggle('Marketing'));

    await user.click(
      screen.getByRole('button', { name: 'Close cookie preferences' }),
    );
    await waitFor(() => expect(preferences()).not.toBeInTheDocument());
    await user.click(
      await screen.findByRole('button', { name: 'Manage preferences' }),
    );

    expect(toggle('Marketing')).toHaveAttribute('aria-checked', 'false');
  });

  it('dismisses the saved message on demand', async () => {
    const user = userEvent.setup();
    renderConsent();
    await user.click(await screen.findByRole('button', { name: 'Accept all' }));

    await user.click(screen.getByRole('button', { name: 'Dismiss' }));

    expect(screen.queryByRole('status')).not.toBeInTheDocument();
  });

  it('starts from a fresh consent when stored data has another version', async () => {
    window.localStorage.setItem(
      'parka:cookie-consent',
      JSON.stringify({ version: 999, preferences: {}, updatedAt: '' }),
    );

    renderConsent();

    expect(
      await screen.findByRole('region', { name: 'We use cookies' }),
    ).toBeVisible();
  });

  it('restores the preferences dialog from the URL', async () => {
    window.history.replaceState(null, '', '/?modal=cookies');

    renderConsent();

    expect(
      await screen.findByRole('dialog', { name: 'Cookie preferences' }),
    ).toBeVisible();
  });
});
