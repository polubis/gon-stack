// Filters are applied directly in the facade before re-triggering [TRIGGER]_GAMES_WALL_INIT.
//
// Usage pattern in the facade:
//   store.$gameFilters.set(filters);
//   bus.trigger('[TRIGGER]_GAMES_WALL_INIT', { roomId: store.$activeRoomId.get()! });
//
// Similarly for participant filters:
//   store.$participantFilters.set(filters);
//   bus.trigger('[TRIGGER]_GAMES_WALL_INIT', { roomId: store.$activeRoomId.get()! });
//
// No separate handler is needed since gamesWallInit reads $gameFilters and
// $participantFilters from the store at the time it runs.

export {};
