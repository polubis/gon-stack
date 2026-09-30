# 0020 - clarify commit template and pin lucide-react icons

```json
{
  "status": "done"
}
```

Updated `.claude/rules/git.md`: split the conventional-commit template into two explicit variants (plain `fix(repo):` and breaking `fix(repo)!:`), each with scoped body list, `Reviewed-by` / `Refs` trailers. Added rule 2: one decision/task/work means one commit, never split across many. Updated `.claude/rules/ui.md`: added rule 5 requiring icons via `lucide-react`.

Reason: the single template blurred breaking vs non-breaking shape, so agents had to infer the `!` suffix; two variants make the choice explicit. Atomic-commit rule prevents a single decision scattering across commits. Pinning `lucide-react` keeps icons consistent instead of mixing ad-hoc sets.
