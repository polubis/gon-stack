import {
  createContext,
  useContext as useReactContext,
  type ReactNode,
} from 'react';

/**
 * Validates a PascalCase name that doesn't end with "Provider" or "Context".
 */
type ValidatedName<TName extends string> = TName extends ''
  ? `Error: Name cannot be an empty string.`
  : TName extends `${string} ${string}`
    ? `Error: Name cannot contain spaces.`
    : TName extends `${infer First}${string}`
      ? First extends Uppercase<string>
        ? TName extends
            | `${string}Provider`
            | `${string}Context`
            | `${string}provider`
            | `${string}context`
          ? `Error: Name should not include the 'Provider' or 'Context' keyword.`
          : TName
        : `Error: Name must be in PascalCase (e.g., 'User', 'UserProfile').`
      : TName;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type OneArgFn = ((props: any) => any) | (() => any);

type IsOptional<T> = undefined extends T ? true : false;

/**
 * Creates a strongly-typed React Context Provider and consumer hook.
 *
 * @param displayName PascalCase base name (must not end with "Provider"/"Context").
 * @param useHook Custom hook whose return value is placed into context.
 */
export const context = <TName extends string, THook extends OneArgFn>(
  displayName: ValidatedName<TName>,
  useHook: THook,
) => {
  type HookData = Parameters<THook>[0];
  type HookReturn = ReturnType<THook>;

  const Context = createContext<HookReturn | null>(null);
  Context.displayName = `${displayName}Context`;

  type ProviderProps = {
    children: ReactNode;
  } & (HookData extends undefined
    ? { value?: never }
    : IsOptional<HookData> extends true
      ? { value?: HookData }
      : { value: HookData });

  const Provider = (props: ProviderProps) => {
    const hookArgs = 'value' in props ? props.value : undefined;
    const hookValue = useHook(hookArgs as HookData);

    return (
      <Context.Provider value={hookValue}>{props.children}</Context.Provider>
    );
  };

  Provider.displayName = `${displayName}Provider`;

  const useContext = (): HookReturn => {
    const context = useReactContext(Context);

    if (context === null) {
      throw new Error(
        `use${displayName}Context must be used within a ${displayName}Provider.`,
      );
    }

    return context;
  };

  return [Provider, useContext, Context] as const;
};
