import { copy } from './copy';

export const OpeningHours = () => (
  <div className="rounded-2xl bg-white p-5 ring-1 ring-line sm:p-6">
    <h3 className="text-xs font-bold tracking-wide text-ink-light uppercase">
      {copy.offerPanel.openingHours.title}
    </h3>
    <ul className="mt-5 divide-y divide-line">
      {copy.offerPanel.openingHours.days.map((day) => (
        <li
          key={day.id}
          className="flex items-start justify-between gap-4 py-3 first:pt-0 last:pb-0"
        >
          <span className="text-sm font-medium text-secondary">
            {day.label}
          </span>
          <div className="space-y-0.5 text-right text-sm text-ink-light">
            {day.closed ? (
              <span>{copy.offerPanel.openingHours.closedLabel}</span>
            ) : (
              day.slots.map((slot) => (
                <span key={slot} className="block">
                  {slot}
                </span>
              ))
            )}
          </div>
        </li>
      ))}
    </ul>
  </div>
);
