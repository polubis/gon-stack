import { type ReactNode } from 'react';

import { Card } from '../../libs/ui/card';
import { Text } from '../../libs/ui/text';

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
        <Text.H2>{title}</Text.H2>
        <Text.B2>{description}</Text.B2>
      </header>
      {children}
    </section>
  );
}

export function CardSandbox() {
  return (
    <div id="card-examples" className="w-full max-w-6xl space-y-6">
      <div className="text-center space-y-2">
        <Text.V1>UI primitive - usage examples</Text.V1>
        <Text.H1>Card Sandbox</Text.H1>
      </div>

      <main className="space-y-8">
        <DocsSection
          id="card-basic"
          title="1) Basic usage"
          description="Simple children-based composition with spacing utilities."
        >
          <Card className="p-5 md:p-6">
            <Text.H3>Date Night Plan</Text.H3>
            <Text.B2>
              Pick a cozy movie and order your favorite dessert.
            </Text.B2>
          </Card>
        </DocsSection>

        <DocsSection
          id="card-structured"
          title="2) Structured content"
          description="Header / body / footer composition with utility classes."
        >
          <Card className="p-5 md:p-6">
            <header className="pb-4 border-b border-surface-200/70">
              <Text.V2>Compatibility Insight</Text.V2>
              <Text.H3>Communication style</Text.H3>
            </header>
            <div className="py-4">
              <Text.B2>
                You both prefer calm conversations and clear expectations.
              </Text.B2>
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
            <Text.H3>Weekly Reflection</Text.H3>
            <Text.B2>
              This week felt meaningful because both partners made space for deeper
              conversations. Small rituals, like checking in before sleep, built
              emotional safety and reduced friction during busy workdays.
            </Text.B2>
            <ul className="list-disc space-y-2 pl-4">
              <li>
                <Text.B2>Shared one appreciation each evening</Text.B2>
              </li>
              <li>
                <Text.B2>Planned one no-phone dinner</Text.B2>
              </li>
              <li>
                <Text.B2>Resolved one conflict with active listening</Text.B2>
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
            <Text.H3>Match summary</Text.H3>
            <Card className="p-4">
              <Text.V2>Shared category</Text.V2>
              <Text.B2>Love Languages</Text.B2>
            </Card>
            <Card className="p-4">
              <Text.V2>Next challenge</Text.V2>
              <Text.B2>Creative Drawing Round</Text.B2>
            </Card>
          </Card>
        </DocsSection>
      </main>
    </div>
  );
}
