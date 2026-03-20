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

export function TextSandbox() {
  return (
    <div id="text-examples" className="w-full max-w-6xl space-y-6">
      <div className="text-center space-y-2">
        <Text.V1>UI primitive - usage examples</Text.V1>
        <Text.H1>Text Sandbox</Text.H1>
      </div>

      <main className="space-y-8">
        <DocsSection
          id="text-headings"
          title="1) Headings (H1-H6)"
          description="Title hierarchy with heading defaults and optional style overrides."
        >
          <Card className="p-5 md:p-6 space-y-3">
            <Text.H1>Heading 1</Text.H1>
            <Text.H2>Heading 2</Text.H2>
            <Text.H3>Heading 3</Text.H3>
            <Text.H4>Heading 4</Text.H4>
            <Text.H5>Heading 5</Text.H5>
            <Text.H6>Heading 6</Text.H6>
          </Card>
        </DocsSection>

        <DocsSection
          id="text-body"
          title="2) Body (B1-B3)"
          description="Body scales for content blocks, helper text, and compact paragraphs."
        >
          <Card className="p-5 md:p-6 space-y-3">
            <Text.B1>
              B1: Primary body copy for core content in cards and sections.
            </Text.B1>
            <Text.B2>
              B2: Secondary body text for supporting descriptions and details.
            </Text.B2>
            <Text.B3>
              B3: Compact body style for dense layouts and low-priority copy.
            </Text.B3>
          </Card>
        </DocsSection>

        <DocsSection
          id="text-meta"
          title="3) Captions, labels and overline (V1-V2)"
          description="Utility text styles for metadata, labels, and two overline variants."
        >
          <Card className="p-5 md:p-6 space-y-4">
            <div className="space-y-1">
              <div>
                <Text.C1>C1 caption - timestamp, helper metadata, tiny notes.</Text.C1>
              </div>
              <div>
                <Text.C2>C2 caption - compact metadata for constrained spaces.</Text.C2>
              </div>
            </div>
            <div className="space-y-1">
              <div>
                <Text.L1>L1 label - uppercase field label</Text.L1>
              </div>
              <div>
                <Text.L2>L2 label - compact uppercase label</Text.L2>
              </div>
            </div>
            <div className="space-y-1">
              <div>
                <Text.V1>Overline V1 for subtle section context</Text.V1>
              </div>
              <div>
                <Text.V2>Overline V2 for emphasized meta context</Text.V2>
              </div>
            </div>
          </Card>
        </DocsSection>

        <DocsSection
          id="text-ornamental"
          title="4) Ornamental (O1-O2)"
          description="Expressive text styles for quotes, decorative subtitles, and accents."
        >
          <Card className="p-5 md:p-6 space-y-3">
            <Text.O1>
              O1: &quot;Love grows best in the little moments we choose each
              day.&quot;
            </Text.O1>
            <Text.O2>
              O2: &quot;Tiny ornamental style for subtle romantic accents.&quot;
            </Text.O2>
          </Card>
        </DocsSection>
      </main>
    </div>
  );
}
