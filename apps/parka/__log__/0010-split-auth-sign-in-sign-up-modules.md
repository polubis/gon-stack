# 0010 - split auth into sign-in and sign-up modules

```json
{
  "status": "done"
}
```

Replaced monolithic `modules/auth` with `modules/sign-in` and `modules/sign-up`: each has own `configuration/e2e-ids.ts`, `integration/repository.ts`, `presentation/main.tsx`, and barrel `index.ts`. Pages `sign-in.astro` / `sign-up.astro` import `@/modules/sign-in` and `@/modules/sign-up`. Root `src/__e2e__/selectors.d.ts` unions `SignInE2eId` and `SignUpE2eId` instead of a single auth module type.

One combined auth UI module forced shared e2e ids and blurred sign-in vs sign-up boundaries. Split matches one module per route and the ideal-example layout used elsewhere in parka. Consequence: auth flows evolve independently; add e2e ids per module and extend the root selector union when adding selectors.
