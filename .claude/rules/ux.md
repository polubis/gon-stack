## UX

1. (A) Proper errors display with pattern: `title:tech-code:description:retry-option:back-option`
2. (A) Skeleton when loading app/modules/features that mimics current layout
3. (A) Spinner in less important places, f.e: search inputs, button indicator
4. (A) Optimistic UI and toasts when create/update/delete happens
5. (A) No data hide during reload, filters change. In that case loading banner
6. (A) No jumping UI
7. (A) Delete via confirmation
8. (A) When filters applied and no data include normalized filters in message. F.e: `No results for "phrase"`
9. (A) No needless duplicates on screen: same info/control shown once. F.e: no preview card repeating what fields already show
10. (A) Each view entry is smoothly animated as a whole (fade + slight slide), disabled with `motion-reduce`