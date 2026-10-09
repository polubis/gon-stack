import type { APIContext, APIRoute } from 'astro';
import { BadRequest } from '../core/error-handling';

type ProcedureResponse = { code: number };
type RedirectResponse = ProcedureResponse & { location: string };

const isRedirectResponse = (
  response: ProcedureResponse,
): response is RedirectResponse => {
  return (
    response.code >= 300 &&
    response.code < 400 &&
    'location' in response &&
    typeof response.location === 'string'
  );
};

export const astroAdapter =
  <TResponse extends ProcedureResponse>(
    procedure: (
      readInput: () => Promise<unknown>,
      context: APIContext,
    ) => Promise<TResponse>,
  ): APIRoute =>
  async (context: APIContext) => {
    const url = new URL(context.request.url);
    const search = Object.fromEntries(url.searchParams.entries());
    const payload = context.params;

    // Lazy: the body is read only when the procedure asks, i.e. after auth.
    const input = async () => ({
      ...(await readBody(context.request)),
      ...search,
      ...payload,
    });

    const response = await procedure(input, context);

    if (isRedirectResponse(response)) {
      return new Response(null, {
        status: response.code,
        headers: { Location: response.location },
      });
    }

    return new Response(JSON.stringify(response), {
      status: response.code,
      headers: { 'Content-Type': 'application/json' },
    });
  };

const readBody = async (request: Request): Promise<Record<string, unknown>> => {
  if (request.method === 'GET' || request.method === 'HEAD') {
    return {};
  }

  const contentType = request.headers.get('content-type') ?? '';

  try {
    if (contentType.includes('multipart/form-data')) {
      const form = await request.formData();
      const result: Record<string, unknown> = {};
      form.forEach((value, key) => {
        result[key] = value;
      });
      return result;
    }

    if (contentType.includes('application/json')) {
      const raw = await request.text();
      if (!raw) return {};

      const parsed: unknown = JSON.parse(raw);

      return isRecord(parsed) ? parsed : {};
    }
  } catch (error) {
    throw new BadRequest(error, 'Malformed request body');
  }

  return {};
};

const isRecord = (value: unknown): value is Record<string, unknown> => {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
};
