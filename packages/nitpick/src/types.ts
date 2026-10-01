/** Outcome of one check; printed by the CLI in a stable order. */
export type CheckResult = {
  name: string;
  ok: boolean;
  /** Passed, but with a warning worth surfacing (does not fail the run). */
  warn?: boolean;
  lines: string[];
};
