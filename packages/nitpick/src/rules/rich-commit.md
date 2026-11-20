## Rich Commit

1. Commit message follows {{ref:rich-commit-template}}.
2. Subject `type(scope): title`, scope required, `!` before `:` for breaking change.
3. Blank line, then a `- ` change list. Nested `  - ` items allowed.
4. The list ends the message. Only exception: one final `Claude-Session: https://claude.ai/code/session_<id>` line, optionally after a blank line. Nothing else after the last list item: no footer, trailer (`Key: value`), reference (`Refs`, `Fixes`, `Closes`), `Co-authored-by`, `Signed-off-by` or AI credit.
5. No blank lines inside the list.
