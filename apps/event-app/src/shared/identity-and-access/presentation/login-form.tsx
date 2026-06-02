import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast, Toaster } from 'sonner';
import { z } from 'zod';
import { loginUser } from '../integration/repository';

const schema = z.object({
  email: z.email('Podaj prawidłowy adres e-mail'),
  password: z.string().min(1, 'Hasło jest wymagane'),
});

type FormValues = z.infer<typeof schema>;

export const LoginForm = () => {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: FormValues) => {
    const result = await loginUser(data);

    if (result.success) {
      window.location.assign('/');
    } else {
      toast.error('Coś poszło nie tak. Spróbuj ponowni później.');
    }
  };

  return (
    <>
      <Toaster richColors />
      <div className="min-h-screen flex items-center justify-center bg-bg px-4">
        <div className="w-full max-w-110">
          <h1 className="subsection-heading text-center mb-8 text-ink">
            Zaloguj się
          </h1>

          <form
            onSubmit={handleSubmit(onSubmit)}
            className="flex flex-col gap-4"
          >
            <div className="flex flex-col gap-1.5">
              <label htmlFor="email" className="text-sm font-medium text-ink">
                Email
              </label>
              <input
                id="email"
                type="email"
                placeholder="Twój adres e-mail"
                {...register('email')}
                className="w-full rounded-xs border border-hairline bg-canvas px-4 py-3 text-sm text-ink placeholder:text-muted outline-none transition-colors focus:border-primary"
              />
              {errors.email && (
                <p className="text-xs text-red-500">{errors.email.message}</p>
              )}
            </div>

            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="password"
                className="text-sm font-medium text-ink"
              >
                Hasło
              </label>
              <input
                id="password"
                type="password"
                placeholder="Twoje hasło"
                {...register('password')}
                className="w-full rounded-xs border border-hairline bg-canvas px-4 py-3 text-sm text-ink placeholder:text-muted outline-none transition-colors focus:border-primary"
              />
              {errors.password && (
                <p className="text-xs text-red-500">
                  {errors.password.message}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="mt-2 w-full rounded-pill bg-primary py-3 text-sm font-medium text-on-primary transition-opacity hover:opacity-80 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isSubmitting ? 'Logowanie...' : 'Kontynuuj'}
            </button>
          </form>

          <div className="relative my-6 flex items-center gap-3">
            <div className="h-px flex-1 bg-hairline" />
            <span className="text-xs text-muted">LUB</span>
            <div className="h-px flex-1 bg-hairline" />
          </div>

          <div className="flex flex-col gap-3">
            <form method="post" action="/api/auth/google">
              <input type="hidden" name="provider" value="google" />
              <button
                type="submit"
                className="flex items-center justify-center gap-3 w-full rounded-xs border border-hairline bg-canvas px-4 py-3 text-sm font-medium text-ink transition-colors hover:bg-bg"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  width="18"
                  height="18"
                  aria-hidden="true"
                >
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                Kontynuuj z Google
              </button>
            </form>

            <form method="post" action="/api/auth/facebook">
              <input type="hidden" name="provider" value="facebook" />
              <button
                type="submit"
                className="flex items-center justify-center gap-3 w-full rounded-xs border border-hairline bg-canvas px-4 py-3 text-sm font-medium text-ink transition-colors hover:bg-bg"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  width="18"
                  height="18"
                  aria-hidden="true"
                >
                  <path
                    fill="#1877F2"
                    d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"
                  />
                </svg>
                Kontynuuj z Facebook
              </button>
            </form>
          </div>

          <p className="mt-6 text-center text-sm text-body-muted">
            Nie masz konta?{' '}
            <a
              href="/register"
              className="font-medium text-action-blue hover:underline"
            >
              Zarejestruj się
            </a>
          </p>
        </div>
      </div>
    </>
  );
};
