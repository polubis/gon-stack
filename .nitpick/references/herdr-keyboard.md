# Herdr keyboard navigation

Source `https://herdr.dev/docs/keyboard/` v0.9.1. Mouse-native. Keyboard optional via prefix, default `ctrl+b`.

`prefix+c` = press `ctrl+b`, release, press `c`.

## Prefix

| Keys                             | Meaning                    |
| -------------------------------- | -------------------------- |
| `prefix+?`                       | Show all active bindings   |
| `/` in help                      | Filter actions + shortcuts |
| `Backspace` / `ctrl+u` in filter | Edit / clear filter        |

## First five

| Keys                        | Action                             |
| --------------------------- | ---------------------------------- |
| `prefix+c`                  | New tab                            |
| `prefix+v` / `prefix+minus` | Split right / down                 |
| `prefix+h/j/k/l`            | Move pane left / down / up / right |
| `prefix+w`                  | Workspace navigation               |
| `prefix+q`                  | Detach, leave running              |

## Panes

| Keys                   | Action                 |
| ---------------------- | ---------------------- |
| `prefix+z`             | Zoom focused pane      |
| `prefix+x`             | Close pane             |
| `prefix+shift+h/j/k/l` | Swap pane in direction |
| `prefix+r`             | Resize mode            |
| `prefix+[`             | Copy mode              |

## Tabs

| Keys                    | Action              |
| ----------------------- | ------------------- |
| `prefix+n` / `prefix+p` | Next / previous tab |
| `prefix+1..9`           | Jump tab 1-9        |
| `prefix+shift+t`        | Rename tab          |
| `prefix+shift+x`        | Close tab           |

## Workspaces + session

| Keys             | Action           |
| ---------------- | ---------------- |
| `prefix+shift+n` | New workspace    |
| `prefix+shift+w` | Rename workspace |
| `prefix+shift+d` | Close workspace  |
| `prefix+g`       | Goto picker      |
| `prefix+b`       | Toggle sidebar   |

Full keymap + syntax: `/docs/configuration/#keybindings`.

## Editing Herdr fields

Herdr-owned fields only. Not shell / agent in pane.

| Keys                                        | Action                                                 |
| ------------------------------------------- | ------------------------------------------------------ |
| `Left` / `Right`, `Ctrl+B` / `Ctrl+F`       | Move one char, grapheme-aware                          |
| `Home` / `End`, `Ctrl+A` / `Ctrl+E`         | Start / end                                            |
| `Alt+B` / `Alt+F`                           | Move one word back / fwd. Needs terminal Alt/Meta      |
| `Backspace`, `Ctrl+H`                       | Delete prev char                                       |
| `Delete`, `Ctrl+D`                          | Delete next char                                       |
| `Ctrl+U` / `Ctrl+K`                         | Cut to start / end. In-field only, no system clipboard |
| `Ctrl+W`, `Alt+Backspace`, `Ctrl+Backspace` | Cut prev word                                          |
| `Alt+D`                                     | Cut next word                                          |
| `Ctrl+Y`                                    | Insert last cut                                        |
| `Enter` / `Esc`                             | Confirm / cancel dialog                                |

Typing + paste insert at cursor. Long values scroll horizontal.

## Copy mode

Enter `prefix+[`. No pane pause. Output live, follows bottom, pinned when in history. Mouse drag copies without copy mode.

| Keys                                                 | Action                                                                                |
| ---------------------------------------------------- | ------------------------------------------------------------------------------------- |
| `h/j/k/l`                                            | Move cursor                                                                           |
| `w/b/e`                                              | Next / back word, end word                                                            |
| `W/B/E`                                              | Big-word, whitespace only                                                             |
| `{` / `}`                                            | Paragraph back / fwd                                                                  |
| `PageUp` / `PageDown`, `ctrl+f`, `ctrl+u` / `ctrl+d` | Page / half-page scroll. Default prefix steals `ctrl+b`, use other prefix for page-up |
| `/` / `?`                                            | Fwd / back literal search. Case-insensitive unless uppercase in query                 |
| `n` / `N`                                            | Repeat search same / opposite dir                                                     |
| `v` or `Space`                                       | Start selection. Stays active during output redraws                                   |
| `y` or `Enter`                                       | Copy range current text, not frozen snapshot                                          |
| `q` or `Esc`                                         | Leave, no copy. `Esc` clears selection / search first                                 |

Resize or normal / alt screen switch clears selection.

## Change anything

```toml
[keys]
prefix = "ctrl+a"
```

All bindings configurable, incl prefix.

## Prefix-free

Direct chords need no prefix. Must survive OS + outer terminal + in-pane program. `ctrl+alt` family free almost everywhere. Safe default. Not hit by macOS option-compose.

```toml
[keys]
focus_pane_left = ["prefix+h", "ctrl+alt+h"]
focus_pane_down = ["prefix+j", "ctrl+alt+j"]
focus_pane_up = ["prefix+k", "ctrl+alt+k"]
focus_pane_right = ["prefix+l", "ctrl+alt+l"]
previous_tab = ["prefix+p", "ctrl+alt+["]
next_tab = ["prefix+n", "ctrl+alt+]"]
new_tab = ["prefix+c", "ctrl+alt+c"]
split_vertical = ["prefix+v", "ctrl+alt+d"]
split_horizontal = ["prefix+minus", "ctrl+alt+shift+d"]
zoom = ["prefix+z", "ctrl+alt+z"]
```

Avoid, owned elsewhere:

| Chord                       | Owner                                       |
| --------------------------- | ------------------------------------------- |
| `ctrl+alt+arrows`           | GNOME workspace, Ghostty + Konsole defaults |
| `ctrl+alt+t`                | Launch terminal Ubuntu + Fedora             |
| `ctrl+alt+l` / `ctrl+alt+a` | KDE lock / attention                        |
| `ctrl+alt+s` / `ctrl+alt+u` | Konsole                                     |
| `ctrl+alt+f1..f12`          | Linux virtual console                       |

Dead chord = terminal / DE ate it. Free chord in terminal settings or pick other chord in Herdr.
