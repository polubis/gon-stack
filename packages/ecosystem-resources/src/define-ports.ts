export type PortRange = readonly [min: number, max: number];

export type PortsDefinition<
  R extends Record<string, PortRange>,
  P extends { [K in keyof R]: Record<string, number> },
> = { ranges: R; ports: P };

const MIN_PORT = 1024;
const MAX_PORT = 65535;

const isPort = (value: number): boolean =>
  Number.isInteger(value) && value >= MIN_PORT && value <= MAX_PORT;

const rangeProblems = (
  ranges: Record<string, PortRange>,
  ports: Record<string, Record<string, number>>,
): string[] => {
  const problems: string[] = [];
  const names = Object.keys(ranges);
  for (const name of names) {
    const [min, max] = ranges[name]!;
    if (!isPort(min) || !isPort(max) || min > max)
      problems.push(
        `range "${name}" [${min}, ${max}] must be integers min <= max inside ${MIN_PORT}-${MAX_PORT}`,
      );
    if (!(name in ports)) problems.push(`range "${name}" has no ports`);
  }
  for (const name of Object.keys(ports))
    if (!(name in ranges)) problems.push(`ports "${name}" has no range`);
  names.forEach((name, index) => {
    const [min, max] = ranges[name]!;
    for (const other of names.slice(index + 1)) {
      const [otherMin, otherMax] = ranges[other]!;
      if (min <= otherMax && otherMin <= max)
        problems.push(
          `ranges "${name}" [${min}, ${max}] and "${other}" [${otherMin}, ${otherMax}] overlap`,
        );
    }
  });
  return problems;
};

const portProblems = (
  ranges: Record<string, PortRange>,
  ports: Record<string, Record<string, number>>,
): string[] => {
  const problems: string[] = [];
  const owners = new Map<number, string>();
  for (const [group, services] of Object.entries(ports)) {
    const range = ranges[group];
    for (const [service, port] of Object.entries(services)) {
      const id = `${group}.${service}`;
      if (!isPort(port)) {
        problems.push(
          `${id} = ${port} is not a port in ${MIN_PORT}-${MAX_PORT}`,
        );
        continue;
      }
      if (range && (port < range[0] || port > range[1]))
        problems.push(
          `${id} = ${port} is outside its range "${group}" [${range[0]}, ${range[1]}]`,
        );
      const owner = owners.get(port);
      if (owner) problems.push(`${id} = ${port} is already used by ${owner}`);
      else owners.set(port, id);
    }
  }
  return problems;
};

export const validatePorts = (definition: {
  ranges: Record<string, PortRange>;
  ports: Record<string, Record<string, number>>;
}): string[] => [
  ...rangeProblems(definition.ranges, definition.ports),
  ...portProblems(definition.ranges, definition.ports),
];

/**
 * Declares the port registry. Types force every group to have both a range and
 * ports; at runtime it throws on out-of-range, duplicate or overlapping ports,
 * so a bad registry fails when the config loads, never at bind time.
 */
export const definePorts = <
  const R extends Record<string, PortRange>,
  const P extends { [K in keyof R]: Record<string, number> },
>(
  definition: PortsDefinition<R, P>,
): PortsDefinition<R, P> => {
  const problems = validatePorts(definition);
  if (problems.length > 0)
    throw new Error(`Invalid port registry:\n- ${problems.join('\n- ')}`);
  return definition;
};
