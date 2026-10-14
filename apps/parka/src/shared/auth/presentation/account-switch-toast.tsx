import { useState } from 'react';
import { Toast } from '@/shared/ui/toast';
import { SWITCH_TOAST_KEY } from '../configuration/constraints';

const takeSwitchedEmail = (): string | null => {
  try {
    const email = window.sessionStorage.getItem(SWITCH_TOAST_KEY);
    window.sessionStorage.removeItem(SWITCH_TOAST_KEY);
    return email;
  } catch {
    return null;
  }
};

/** Confirms an account switch on the page the switch reloaded into. */
export const AccountSwitchToast = () => {
  const [email, setEmail] = useState<string | null>(takeSwitchedEmail);

  return email ? (
    <Toast
      notice={{ tone: 'success', message: `Przełączono na ${email}` }}
      data-e2e="account-menu:switched-toast"
      onClose={() => setEmail(null)}
    />
  ) : null;
};
