# 0010 - vacation goals CRUD

```json
{
  "status": "done"
}
```

- Goals card renamed `Cele wakacyjne`; added edit + delete (create/list existed).
- Core: `[TRIGGER]_UPDATE_GOAL`, `[TRIGGER]_DELETE_GOAL` handlers, optimistic with rollback + toast.
- Integration: `putGoal`, `deleteGoal` (endpoints already existed).
- UI: `new-goal-form` -> `goal-form` (create/edit, `Odłożono` field, `Usuń cel`), pencil button per row.
- Tests: update/delete success + rollback.

Backend had update/delete procedures, dashboard only exposed create.
