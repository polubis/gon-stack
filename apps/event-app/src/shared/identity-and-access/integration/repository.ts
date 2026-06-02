export type LoginPayload = {
  email: string;
  password: string;
};

export type RegisterPayload = {
  email: string;
  password: string;
};

export type RegisterResult = { success: true } | { success: false };

export const registerUser = async (
  payload: RegisterPayload,
): Promise<RegisterResult> => {
  try {
    const response = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    return { success: response.ok };
  } catch {
    return { success: false };
  }
};

export type LoginResult = { success: true } | { success: false };

export const loginUser = async (
  payload: LoginPayload,
): Promise<LoginResult> => {
  try {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    return { success: response.ok };
  } catch {
    return { success: false };
  }
};
