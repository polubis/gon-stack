import { useContext } from './context';

/** Select mode strip: how many are chosen, choose all, leave the mode. */
export const SelectionBar = () => {
  const ctx = useContext();
  const selected = ctx.useSelected().length;
  const total = ctx.useNotifications().length;

  return (
    <div
      data-e2e="notifications:selection-bar"
      className="flex flex-wrap items-center justify-between gap-2 rounded-2xl bg-brand-soft px-3 py-2 text-sm"
    >
      <p role="status" className="font-semibold text-brand-dark">
        Zaznaczono: {selected}
      </p>
      <div className="flex items-center gap-1">
        <button
          type="button"
          data-e2e="notifications:select-all"
          onClick={ctx.selectAll}
          className="rounded-lg px-2 py-1 text-xs font-semibold text-brand-dark hover:bg-brand-softer"
        >
          {selected === total ? 'Odznacz wszystkie' : 'Zaznacz wszystkie'}
        </button>
        <button
          type="button"
          data-e2e="notifications:cancel-select"
          onClick={ctx.toggleSelecting}
          className="rounded-lg px-2 py-1 text-xs font-semibold text-brand-dark hover:bg-brand-softer"
        >
          Anuluj
        </button>
      </div>
    </div>
  );
};
