import {
    createContext,
    useContext as useReactContext,
    type ReactNode,
  } from 'react';
  
  /**
   * A TypeScript utility type that validates a string. It enforces two rules:
   * 1. The string must be in PascalCase.
   * 2. The string must NOT end with "Provider" or "Context".
   * If valid, it returns the string. If invalid, it returns a specific error
   * message type, causing a compile-time error.
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
            : TName // This is the final success path.
          : `Error: Name must be in PascalCase (e.g., 'User', 'UserProfile').`
        : TName; // Should be unreachable, but keeps the type sound.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  type OneArgFn = ((props: any) => any) | (() => any);
  
  // Helper type to check if a parameter is optional
  type IsOptional<T> = undefined extends T ? true : false;
  
  /**
   * Creates a strongly-typed React Context Provider and consumer hook.
   *
   * @param displayName The base name for the components in PascalCase, e.g., "User".
   *   It must not end with "Provider" or "Context".
   * @param useHook The custom hook to be placed into context.
   */
  export const createHookContext = <TName extends string, THook extends OneArgFn>(
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
  