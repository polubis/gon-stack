import { type ReactNode } from 'react';

import { Card } from '../../../../libs/ui/card';

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
        <h2 className="t2">{title}</h2>
        <p className="b2">{description}</p>
      </header>
      {children}
    </section>
  );
}

export function CardDemo() {
  return (
    <div id="card-examples" className="w-full max-w-6xl space-y-6">
      <div className="text-center space-y-2">
        <p className="v1">UI primitive - usage examples</p>
        <h2 className="t2">Card Demo</h2>
      </div>

      <main className="space-y-8">
        <DocsSection
          id="card-basic"
          title="1) Basic usage"
          description="Simple children-based composition with spacing utilities."
        >
          <Card className="p-5 md:p-6">
            <h3 className="t3">Date Night Plan</h3>
            <p className="b2">
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
              <p className="v2">Compatibility Insight</p>
              <h3 className="t3">Communication style</h3>
            </header>
            <div className="py-4">
              <p className="b2">
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
            <h3 className="t3">Weekly Reflection</h3>
            <p className="b2">
              This week felt meaningful because both partners made space for deeper
              conversations. Small rituals, like checking in before sleep, built
              emotional safety and reduced friction during busy workdays.
            </p>
            <ul className="list-disc space-y-2 pl-4">
              <li>
                <p className="b2">Shared one appreciation each evening</p>
              </li>
              <li>
                <p className="b2">Planned one no-phone dinner</p>
              </li>
              <li>
                <p className="b2">Resolved one conflict with active listening</p>
              </li>
            </ul>
          </Card>
        </DocsSection>

        <DocsSection
          id="card-nested"
          title="4) Nested cards"
          description="Card can host nested cards for grouped blocks."
        >
          <Card className="p-5 md:p-6 space-y-3">
            <h3 className="t3">Match summary</h3>
            <Card className="p-4">
              <p className="v2">Shared category</p>
              <p className="b2">Love Languages</p>
            </Card>
            <Card className="p-4">
              <p className="v2">Next challenge</p>
              <p className="b2">Creative Drawing Round</p>
            </Card>
          </Card>
        </DocsSection>
      </main>
    </div>
  );
}
