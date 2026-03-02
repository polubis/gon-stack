/**
 * Typography documentation page. Raw type only — no borders or decorators.
 */

export function TypographyDoc() {
  return (
    <div className="min-h-screen bg-white px-4 py-10">
      <a
        href="#main"
        className="sr-only focus-visible:not-sr-only focus-visible:absolute focus-visible:top-4 focus-visible:left-4 focus-visible:z-50 focus-visible:underline focus-visible:text-black focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2 focus-visible:rounded"
      >
        Skip to content
      </a>
      <main id="main" className="w-full max-w-3xl mx-auto space-y-16">
        <header className="space-y-2">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-gray-500">
            Design system
          </p>
          <h1 className="text-3xl md:text-4xl font-semibold text-black text-balance">
            Typography
          </h1>
          <p className="text-base text-gray-600 text-pretty">
            Heading, paragraph, and label variants using Tailwind rem-based
            utilities. Headings use text-balance for better line wrapping.
          </p>
        </header>

        <section className="space-y-6" aria-labelledby="headings-title">
          <h2 id="headings-title" className="text-xl font-semibold text-black text-balance scroll-mt-6">
            Headings (h1–h6)
          </h2>
          <div className="space-y-6">
            <div className="space-y-1">
              <p className="text-xs font-medium text-gray-500 font-mono">
                h1 · text-4xl (2.25rem) font-semibold text-balance
              </p>
              <h1 className="text-4xl font-semibold text-black text-balance">
                Heading 1
              </h1>
            </div>
            <div className="space-y-1">
              <p className="text-xs font-medium text-gray-500 font-mono">
                h2 · text-3xl (1.875rem) font-semibold text-balance
              </p>
              <h2 className="text-3xl font-semibold text-black text-balance">
                Heading 2
              </h2>
            </div>
            <div className="space-y-1">
              <p className="text-xs font-medium text-gray-500 font-mono">
                h3 · text-2xl (1.5rem) font-semibold text-balance
              </p>
              <h3 className="text-2xl font-semibold text-black text-balance">
                Heading 3
              </h3>
            </div>
            <div className="space-y-1">
              <p className="text-xs font-medium text-gray-500 font-mono">
                h4 · text-xl (1.25rem) font-semibold text-balance
              </p>
              <h4 className="text-xl font-semibold text-black text-balance">
                Heading 4
              </h4>
            </div>
            <div className="space-y-1">
              <p className="text-xs font-medium text-gray-500 font-mono">
                h5 · text-lg (1.125rem) font-semibold text-balance
              </p>
              <h5 className="text-lg font-semibold text-black text-balance">
                Heading 5
              </h5>
            </div>
            <div className="space-y-1">
              <p className="text-xs font-medium text-gray-500 font-mono">
                h6 · text-base (1rem) font-semibold text-balance
              </p>
              <h6 className="text-base font-semibold text-black text-balance">
                Heading 6
              </h6>
            </div>
          </div>
        </section>

        <section className="space-y-6" aria-labelledby="paragraphs-title">
          <h2 id="paragraphs-title" className="text-xl font-semibold text-black text-balance scroll-mt-6">
            Paragraphs (p1–p2)
          </h2>
          <div className="space-y-6">
            <div className="space-y-1">
              <p className="text-xs font-medium text-gray-500 font-mono">
                p1 · text-base (1rem) · primary body
              </p>
              <p className="text-base text-black text-pretty">
                Use for main body copy. This size is 1rem and works well for
                readable paragraphs and descriptions.
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-xs font-medium text-gray-500 font-mono">
                p2 · text-sm (0.875rem) · secondary body
              </p>
              <p className="text-sm text-gray-700 text-pretty">
                Use for secondary text, captions, or supporting copy. Slightly
                smaller at 0.875rem for hierarchy.
              </p>
            </div>
          </div>
        </section>

        <section className="space-y-6" aria-labelledby="labels-title">
          <h2 id="labels-title" className="text-xl font-semibold text-black text-balance scroll-mt-6">
            Labels (l1–l2)
          </h2>
          <div className="space-y-6">
            <div className="space-y-1">
              <p className="text-xs font-medium text-gray-500 font-mono">
                l1 · text-sm (0.875rem) font-semibold uppercase tracking-[0.18em]
              </p>
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-black">
                Section label
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-xs font-medium text-gray-500 font-mono">
                l2 · text-xs (0.75rem) font-medium
              </p>
              <p className="text-xs font-medium text-gray-700">
                Field label
              </p>
            </div>
          </div>
        </section>

        <section className="space-y-3" aria-labelledby="rem-title">
          <h2 id="rem-title" className="text-lg font-semibold text-black text-balance scroll-mt-6">
            Tailwind rem scale (reference)
          </h2>
          <ul className="text-sm text-gray-700 space-y-1 font-mono tabular-nums">
            <li>text-xs = 0.75rem (12px)</li>
            <li>text-sm = 0.875rem (14px)</li>
            <li>text-base = 1rem (16px)</li>
            <li>text-lg = 1.125rem (18px)</li>
            <li>text-xl = 1.25rem (20px)</li>
            <li>text-2xl = 1.5rem (24px)</li>
            <li>text-3xl = 1.875rem (30px)</li>
            <li>text-4xl = 2.25rem (36px)</li>
            <li>text-5xl = 3rem (48px)</li>
            <li>text-6xl = 3.75rem (60px)</li>
          </ul>
        </section>
      </main>
    </div>
  );
}
