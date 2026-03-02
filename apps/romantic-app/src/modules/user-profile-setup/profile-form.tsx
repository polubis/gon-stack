export function ProfileForm() {
  return (
    <div className="min-h-screen bg-slate-950 px-4 py-10 flex items-center justify-center">
      <div className="w-full max-w-5xl rounded-3xl border border-slate-800 bg-slate-900/70 shadow-2xl shadow-slate-950/60 backdrop-blur">
        <div className="grid gap-10 p-6 md:p-8 lg:grid-cols-[1.4fr,2fr]">
          {/* Left column – multi-step progress */}
          <div className="flex flex-col justify-between gap-10">
            <div className="space-y-4">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                Profile Setup
              </p>
              <h1 className="text-2xl md:text-3xl font-semibold text-white">
                Set up your romantic profile
              </h1>
              <p className="text-sm text-slate-400 max-w-md">
                This component only shows the visual layout of a multi-step form.
                Behaviour, validation, and navigation will be wired in separately.
              </p>
            </div>

            <div className="space-y-6">
              {/* Steps row */}
              <div className="flex items-center gap-4">
                {/* Step 1 – completed */}
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-500 text-sm font-semibold text-white shadow-md shadow-emerald-500/40">
                    ✓
                  </div>
                  <div className="space-y-0.5">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-emerald-300">
                      Step 1
                    </p>
                    <p className="text-xs font-medium text-white">Profile details</p>
                    <p className="text-[10px] text-emerald-300/90">Completed</p>
                  </div>
                </div>
                <div className="h-px flex-1 rounded-full bg-emerald-400/40" />

                {/* Step 2 – completed */}
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-500 text-sm font-semibold text-white shadow-md shadow-emerald-500/40">
                    ✓
                  </div>
                  <div className="space-y-0.5">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-emerald-300">
                      Step 2
                    </p>
                    <p className="text-xs font-medium text-white">Romantic vibe</p>
                    <p className="text-[10px] text-emerald-300/90">Completed</p>
                  </div>
                </div>
                <div className="h-px flex-1 rounded-full bg-indigo-400/40" />

                {/* Step 3 – current */}
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-indigo-500 text-sm font-semibold text-white shadow-md shadow-indigo-500/40">
                    <span className="inline-flex h-4 w-4 items-center justify-center rounded-full border border-white/40 text-[10px]">
                      3
                    </span>
                  </div>
                  <div className="space-y-0.5">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-indigo-200">
                      Step 3
                    </p>
                    <p className="text-xs font-medium text-white">Connection details</p>
                    <p className="inline-flex items-center gap-1 rounded-full bg-indigo-500/10 px-2 py-0.5 text-[10px] font-medium text-indigo-200">
                      <span className="h-1 w-1 rounded-full bg-indigo-300" />
                      In progress
                    </p>
                  </div>
                </div>
                <div className="h-px flex-1 rounded-full bg-slate-700/80" />

                {/* Step 4 – pending */}
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-800 text-sm font-semibold text-slate-400 border border-slate-700">
                    4
                  </div>
                  <div className="space-y-0.5">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                      Step 4
                    </p>
                    <p className="text-xs font-medium text-slate-300">
                      Final touches
                    </p>
                    <p className="text-[10px] text-slate-500">Pending</p>
                  </div>
                </div>
              </div>

              <p className="text-[11px] text-slate-500">
                This layout mimics a multi-step progress indicator with completed,
                current, and upcoming steps using pure Tailwind CSS classes only.
              </p>
            </div>
          </div>

          {/* Right column – form card */}
          <div className="rounded-3xl border border-slate-800 bg-slate-950/70 px-5 py-6 md:px-7 md:py-7 shadow-xl shadow-black/70">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                  Step 3 / 4
                </p>
                <h2 className="mt-1 text-base md:text-lg font-semibold text-white">
                  Connection preferences
                </h2>
              </div>
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-indigo-500/20 text-indigo-300">
                <span className="text-sm">❤</span>
              </div>
            </div>

            <div className="mt-4 h-1.5 w-full rounded-full bg-slate-800">
              <div className="h-1.5 w-3/4 rounded-full bg-indigo-500" />
            </div>

            <div className="mt-6 space-y-5">
              <div className="space-y-2">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                  Card details
                </p>
                <div className="rounded-2xl border border-slate-800 bg-slate-900/70 px-4 py-3">
                  <p className="text-xs text-slate-500">Name on card</p>
                  <p className="mt-1 text-sm font-medium text-white">
                    Alex Parkinson
                  </p>
                </div>
              </div>

              <form className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-200">
                    Card number
                  </label>
                  <div className="flex items-center gap-2 rounded-2xl border border-slate-800 bg-slate-900/80 px-4 py-3">
                    <div className="flex h-7 w-10 items-center justify-center rounded-xl bg-indigo-500 text-[11px] font-semibold text-white">
                      ****
                    </div>
                    <input
                      type="text"
                      placeholder="4858 3445 1234 5678"
                      className="flex-1 bg-transparent text-sm text-white placeholder:text-slate-500 outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-slate-200">
                      Expiry
                    </label>
                    <div className="rounded-2xl border border-slate-800 bg-slate-900/80 px-4 py-2.5">
                      <input
                        type="text"
                        placeholder="MM / YY"
                        className="w-full bg-transparent text-sm text-white placeholder:text-slate-500 outline-none"
                      />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-slate-200">
                      CVV
                    </label>
                    <div className="rounded-2xl border border-slate-800 bg-slate-900/80 px-4 py-2.5">
                      <input
                        type="text"
                        placeholder="***"
                        className="w-full bg-transparent text-sm text-white placeholder:text-slate-500 outline-none"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2 pt-1">
                  <button
                    type="button"
                    className="inline-flex w-full items-center justify-center rounded-2xl bg-indigo-500 px-4 py-3 text-sm font-medium text-white shadow-lg shadow-indigo-500/40 transition-colors hover:bg-indigo-400"
                  >
                    Save and continue
                  </button>
                  <p className="text-[11px] text-slate-500 text-center">
                    This button is decorative only in this layout. Multi-step
                    behaviour will be implemented elsewhere.
                  </p>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

