# Content Maker

## Dictionary

- **[fragment]** - any content selected in the editor: text, table, or other GFM element
- **[prompt]** - reusable AI instruction template saved by the user
- **[quick_actions_panel]** - UI panel that opens after a [fragment] is selected, displaying the user's saved [prompt] list for picking
- **[tab_suggestion]** - Cursor-style inline ghost-text suggestion auto-triggered after idle timeout, applying a user-configured [prompt]
- **[modification_queue]** - priority queue that sequences AI operations; priority is auto-detected from recent editor changes
- **[ai_provider]** - Chrome Built-in AI or a direct external API (e.g. OpenRouter) accessed with a user-supplied token stored only in session memory

## Constraints

- [browser] context: `<target:Chrome modern>`, `<target:Safari modern>`
- [markdown] context: `<flavour:GFM>`
- [persistence] context: `<scope:session-only>` <!-- auto -->
- [ai_token] context: `<storage:session-memory-only>`, `<proxy:none>`
- [ai_operations] context: `<execution:sequential>`

## DoD

User can write a GFM markdown article in a WYSIWYG editor, receive AI-powered inline hints and [tab_suggestion]s, select any [fragment] to improve it via saved or custom [prompt]s from the [quick_actions_panel], and configure shortcuts and [prompt]s globally — all without a backend, using either Chrome Built-in AI or a user-provided API token that stays only in session memory.

### Editor

1. The editor renders content as WYSIWYG (GFM-formatted) while the user types.
2. Content exists only for the current session; there is no server-side save.
3. Standard undo/redo (`Ctrl+Z` / `Ctrl+Y`) works across all operations, including AI modifications.

### AI Provider Setup

1. User can select [ai_provider]: Chrome Built-in AI or a direct external API by supplying a personal token.
2. The token is held only in session memory — never persisted to storage or relayed through a proxy backend.
3. When no token is set and Chrome Built-in AI is unavailable, all AI features are visibly disabled with a clear indicator.

### Fragment Improvement

1. User selects a [fragment] and triggers the improvement action.
2. The [quick_actions_panel] opens and displays the user's saved [prompt] list (flat, global).
3. User picks one [prompt]; the [ai_provider] applies it to the [fragment] automatically with no further confirmation step.
4. All AI apply operations on the same document run through the [modification_queue] sequentially to avoid conflicts.
5. Any AI modification can be undone with standard `Ctrl+Z`.

### Tab Suggestion

1. After a user-configurable idle timeout, a [tab_suggestion] appears as inline ghost text at the cursor position.
2. The suggestion content is inferred from the text around the cursor — based on what the user last typed or modified.
3. The operation driving the [tab_suggestion] is user-configurable: the user selects which saved [prompt] (e.g. grammar fix, style change) is used.
4. Pressing `Tab` accepts the suggestion; continuing to type cancels the current ghost text.
5. If the user types while a [tab_suggestion] is loading, the suggestion is queued, not discarded.

### Prompt Management

1. User can create, read, update, and delete [prompt] entries (full CRUD).
2. [prompt] list is global (not scoped per article) and stored as a flat unordered list.
3. Each [prompt] can serve as the [tab_suggestion] driver or be triggered manually via [quick_actions_panel].

### Modification Queue

1. The [modification_queue] orders pending AI operations by priority.
2. Priority is auto-detected by the system based on what the user recently changed in the editor; the user does not configure it manually.
3. Operations are applied strictly sequentially; no parallel AI writes occur.

### Shortcut Customisation

1. All AI-trigger actions have user-configurable keyboard shortcuts defined in a config file.
2. When a new binding conflicts with an existing one, the app displays a warning but allows the binding, silently overriding the previous shortcut.
