import { useContext } from '../context';

export const CategorySelection = () => {
  const ctx = useContext();
  const categories = ctx.useCategories();
  const players = ctx.usePlayers();
  const isLoading = ctx.useIsLoading();
  const isConnected = ctx.useIsConnected();

  return (
    <div className="flex flex-col gap-5">
      <header className="space-y-1">
        <h2 className="text-2xl font-semibold">Choose a category</h2>
        <p className="text-sm opacity-80">
          Partner sync: {isConnected ? 'connected' : 'connecting'} | Players:{' '}
          {players.map((player) => `${player.name} (${player.score})`).join(' vs ')}
        </p>
      </header>
      <div className="grid gap-3">
        {categories.map((category) => (
          <button
            key={category.id}
            type="button"
            className="rounded-xl border border-white/20 p-4 text-left hover:bg-white/10 transition"
            disabled={isLoading}
            onClick={() => ctx.selectCategory(category.id)}
          >
            <p className="font-medium">{category.label}</p>
            <p className="text-sm opacity-80">{category.description}</p>
          </button>
        ))}
      </div>
    </div>
  );
};
