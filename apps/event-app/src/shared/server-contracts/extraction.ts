export type InferOut<
  TUnion extends { code: number },
  TCode extends TUnion['code'] | undefined = undefined,
> = [TCode] extends [undefined] ? TUnion : Extract<TUnion, { code: TCode }>;
