// eslint-disable-next-line @typescript-eslint/no-explicit-any
type CommandHandler = (...args: any[]) => any;

type CommandRegistry = Record<string, CommandHandler>;

type CommandStep<TCommands extends CommandRegistry> = {
  [TKey in keyof TCommands]: [TKey, ...Parameters<TCommands[TKey]>];
}[keyof TCommands];

export const interpreter =
  <TCommands extends CommandRegistry>(commands: TCommands) =>
  async (...steps: CommandStep<TCommands>[]): Promise<void> => {
    for (const step of steps) {
      const [commandName, ...args] = step;

      await commands[commandName](...args);
    }
  };
