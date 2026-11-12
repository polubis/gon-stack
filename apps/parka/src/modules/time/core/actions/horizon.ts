/** Rules are materialized to the end of the shown year: moves inside it read nothing. */
export const horizonFor = (day: string): string => `${day.slice(0, 4)}-12-31`;
