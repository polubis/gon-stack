import { http, HttpResponse } from 'msw';

type Reads = {
  expenses?: object[];
  categories?: object[];
  limits?: object[];
  goals?: object[];
  recurring?: object[];
};

const SUMMARY = {
  userName: 'Anna Kowalska',
  total: 10,
  change: 0,
  previousTotal: 10,
  transactions: 1,
  dailyAverage: 1,
  daily: [{ day: 1, total: 10 }],
  previousDaily: [{ day: 1, total: 10 }],
  monthlyLimit: null,
  categories: [],
};

/** Body of every read the dashboard makes while loading; empty unless given. */
export const readBody = (url: string, reads: Reads = {}) => {
  const data = url.includes('dashboard')
    ? SUMMARY
    : url.includes('expenses')
      ? (reads.expenses ?? [])
      : url.includes('categories')
        ? (reads.categories ?? [])
        : url.includes('limits')
          ? (reads.limits ?? [])
          : url.includes('goals')
            ? (reads.goals ?? [])
            : (reads.recurring ?? []);
  return { code: 200, data };
};

/** msw handlers for all reads of the dashboard load. */
export const readHandlers = (reads: Reads = {}) =>
  ['dashboard', 'expenses', 'categories', 'limits', 'goals', 'recurring'].map(
    (name) =>
      http.get(`/api/${name}/`, ({ request }) =>
        HttpResponse.json(readBody(request.url, reads)),
      ),
  );
