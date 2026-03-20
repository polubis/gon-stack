import { type ReactNode } from 'react';

import { Card } from '../../libs/ui/card';

function DocsSection({
  id,
  title,
  description,
  children,
}: {
  id: string;
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <section id={id} className="space-y-3 scroll-mt-24">
      <header className="space-y-1">
        <h2 className="text-xl text-text-primary">{title}</h2>
        <p className="text-sm text-text-secondary">{description}</p>
      </header>
      {children}
    </section>
  );
}

export function CardSandbox() {
  return (
    <div id="card-examples" className="w-full max-w-6xl space-y-6">
      <div className="text-center space-y-2">
        <p className="text-xs uppercase tracking-[0.18em] text-text-tertiary">
          UI primitive - usage examples
        </p>
        <h1 className="text-3xl text-text-primary">Card Sandbox</h1>
      </div>

      <main className="space-y-8">
        <DocsSection
          id="card-basic"
          title="1) Basic usage"
          description="Simple children-based composition with spacing utilities."
        >
          <Card className="p-5 md:p-6">
            <h3 className="text-xl text-text-primary">Date Night Plan</h3>
            <p className="text-sm text-text-secondary">
              Pick a cozy movie and order your favorite dessert.
            </p>
          </Card>
        </DocsSection>

        <DocsSection
          id="card-structured"
          title="2) Structured content"
          description="Header / body / footer composition with utility classes."
        >
          <Card className="p-5 md:p-6">
            <header className="pb-4 border-b border-surface-200/70">
              <p className="text-xs uppercase tracking-[0.14em] text-text-tertiary">
                Compatibility Insight
              </p>
              <h3 className="text-lg text-text-primary mt-1">Communication style</h3>
            </header>
            <div className="py-4">
              <p className="text-sm text-text-secondary">
                You both prefer calm conversations and clear expectations.
              </p>
            </div>
            <footer className="pt-4 border-t border-surface-200/70">
              <button
                type="button"
                className="variant-button-secondary px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em]"
              >
                See details
              </button>
            </footer>
          </Card>
        </DocsSection>

        <DocsSection
          id="card-long-content"
          title="3) Long content"
          description="Card remains readable with longer text and nested lists."
        >
          <Card className="p-5 md:p-6 space-y-4">
            <h3 className="text-lg text-text-primary">Weekly Reflection</h3>
            <p className="text-sm text-text-secondary leading-relaxed">
              This week felt meaningful because both partners made space for deeper
              conversations. Small rituals, like checking in before sleep, built
              emotional safety and reduced friction during busy workdays.
            </p>
            <ul className="space-y-2 text-sm text-text-secondary list-disc pl-4">
              <li>Shared one appreciation each evening</li>
              <li>Planned one no-phone dinner</li>
              <li>Resolved one conflict with active listening</li>
            </ul>
          </Card>
        </DocsSection>

        <DocsSection
          id="card-nested"
          title="4) Nested cards"
          description="Card can host nested cards for grouped blocks."
        >
          <Card className="p-5 md:p-6 space-y-3">
            <h3 className="text-lg text-text-primary">Match summary</h3>
            <Card className="p-4">
              <p className="text-xs uppercase tracking-[0.12em] text-text-tertiary">
                Shared category
              </p>
              <p className="text-sm text-text-primary mt-1">Love Languages</p>
            </Card>
            <Card className="p-4">
              <p className="text-xs uppercase tracking-[0.12em] text-text-tertiary">
                Next challenge
              </p>
              <p className="text-sm text-text-primary mt-1">Creative Drawing Round</p>
            </Card>
          </Card>
        </DocsSection>
      </main>
    </div>
  );
}
