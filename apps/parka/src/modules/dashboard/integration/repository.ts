import type { DashboardSummary } from '../domain/models';

type DashboardResponse =
  { code: 200; data: DashboardSummary } | { code: number };

export const fetchDashboardSummary = async (
  month: string,
): Promise<DashboardSummary | null> => {
  try {
    const res = await fetch(`/api/dashboard/?month=${month}`, {
      headers: { Accept: 'application/json' },
    });
    if (!res.ok) return null;

    const body = (await res.json()) as DashboardResponse;
    return body.code === 200 && 'data' in body ? body.data : null;
  } catch {
    return null;
  }
};
