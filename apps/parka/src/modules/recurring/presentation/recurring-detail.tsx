import { dateLabel, money } from '../domain/format';
import type { Recurring } from '../domain/models';

export const RecurringDetail = ({ recurring }: { recurring: Recurring }) => (
  <div className="border-t border-line pt-3" data-e2e="recurring:detail">
    <dl className="space-y-1 text-sm">
      <div className="flex justify-between">
        <dt className="text-ink-soft">Metoda płatności</dt>
        <dd>{recurring.paymentMethod}</dd>
      </div>
      <div className="flex justify-between">
        <dt className="text-ink-soft">Koszt</dt>
        <dd className="tabular-nums">{money(recurring.cost)}</dd>
      </div>
    </dl>
    <p className="mb-1 mt-3 text-sm font-semibold">Historia płatności</p>
    <ul className="space-y-1 text-sm">
      {recurring.history.map((h) => (
        <li key={h.date} className="flex justify-between">
          <span className="text-ink-soft">{dateLabel(h.date)}</span>
          <span className="tabular-nums">{money(h.amount)}</span>
        </li>
      ))}
    </ul>
  </div>
);
