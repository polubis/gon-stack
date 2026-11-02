---
ticket: none
scope: parka
summary: Devices recognisable by auto color, model, short id and custom name
why: Dev's and wife's phone both read "Chrome on Windows" and could not be told apart
date: 2026-10-13
tags: [devices, settings, supabase, a11y]
---

- Docs first: `4.expenses.md` (Expense Device 5-7), `9.settings...md` (Device Recognition), `dictionary.md` (`[device_details]`, `[device_color]`, `[device_label]`)
- DB migration `device_profiles`: `device_avatars` renamed, `avatar` nullable, new `custom_name`; expenses get `device_model/os/browser/screen`; owner-only RLS kept
- Client collects details without any model table: `getHighEntropyValues(['model','platformVersion'])` raw code (Android Chromium), else browser + OS + screen
  - Default label `SM-S918B · Android 14 · Chrome`; technical name + resolution stay as secondary text
- Color from FNV hash of device id over 8 design-token pairs (light + dark, contrast >= 4.5), shown by `DeviceBubble` in list badge, popup, settings
- Settings: custom name input with clear "x" (saved on Enter/blur, optimistic + toast), short id `#a3f9`, "To urządzenie" badge, "Rozpoznaj to urządzenie" pulse/focus/scroll with aria-live (static under `motion-reduce`)
  - Settings PUT now writes avatar and custom name; empty profile row is deleted
- Tests: details/label unit, `toDevice`, settings recognition (unit), vibe-test e2e (two identical phones, name, identify, list)
