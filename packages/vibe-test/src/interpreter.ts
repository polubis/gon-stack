// eslint-disable-next-line @typescript-eslint/no-explicit-any
type CommandHandler<TContext> = (context: TContext, ...args: any[]) => any;

/**
 * Pair with `satisfies` on a commands object literal to get every command's
 * destructured context parameters inferred for free, instead of annotating
 * each command by hand: `{ ... } satisfies CommandRegistry<Ctx>`.
 */
export type CommandRegistry<TContext> = Record<
  string,
  CommandHandler<TContext>
>;

type CommandStep<TContext, TCommands extends CommandRegistry<TContext>> = {
  [TKey in keyof TCommands]: TCommands[TKey] extends (
    context: TContext,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ...rest: infer TRest extends any[]
  ) => // eslint-disable-next-line @typescript-eslint/no-explicit-any
  any
    ? [TKey, ...TRest]
    : never;
}[keyof TCommands];

/**
 * `context` (e.g. `page`, or `{ page, getByE2e }`) is injected as every
 * command's first argument, so steps only need to carry the arguments a
 * command actually varies by — no more repeating `page` on every step.
 */
export const interpreter =
  <TContext, TCommands extends CommandRegistry<TContext>>(
    commands: TCommands,
    context: TContext,
  ) =>
  async (...steps: CommandStep<TContext, TCommands>[]): Promise<void> => {
    for (const step of steps) {
      const [commandName, ...args] = step;

      await commands[commandName]?.(context, ...args);
    }
  };
