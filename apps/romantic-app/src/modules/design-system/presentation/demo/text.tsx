import { Example } from './example';
import { Text } from '@/libs/ui/text';

export const TextDemo = () => {
  return (
    <Example
      id="text-examples"
      title="Text"
      description="A typography system component that exposes the design system's type scale and text styles."
    >
      <Example.Case
        id="text-headings"
        title="1) Headings (H1-H6)"
        description="Within this page section, H1-H6 map to their typography styles."
      >
        <div className="space-y-3">
          <Text.T1>Heading 1</Text.T1>
          <Text.T2>Heading 2</Text.T2>
          <Text.T3>Heading 3</Text.T3>
          <Text.T4>Heading 4</Text.T4>
          <Text.T5>Heading 5</Text.T5>
          <Text.T6>Heading 6</Text.T6>
        </div>
      </Example.Case>

      <Example.Case
        id="text-body"
        title="2) Body (B1-B3)"
        description="Body scales for content blocks, helper text, and compact paragraphs."
      >
        <div className="space-y-3">
          <Text.B1>
            B1: Primary body copy for core content in cards and sections.
          </Text.B1>
          <Text.B2>
            B2: Secondary body text for supporting descriptions and details.
          </Text.B2>
          <Text.B3>
            B3: Compact body style for dense layouts and low-priority copy.
          </Text.B3>
        </div>
      </Example.Case>

      <Example.Case
        id="text-meta"
        title="3) Captions, labels and overline (V1-V2)"
        description="Utility text styles for metadata, labels, and two overline variants."
      >
        <div className="space-y-4">
          <div className="space-y-1">
            <div>
              <Text.C1>
                C1 caption - timestamp, helper metadata, tiny notes.
              </Text.C1>
            </div>
            <div>
              <Text.C2>
                C2 caption - compact metadata for constrained spaces.
              </Text.C2>
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
        </div>
      </Example.Case>

      <Example.Case
        id="text-ornamental"
        title="4) Ornamental (O1-O2)"
        description="Expressive text styles for quotes, decorative subtitles, and accents."
      >
        <div className="space-y-3">
          <Text.O1>
            O1: &quot;Love grows best in the little moments we choose each
            day.&quot;
          </Text.O1>
          <Text.O2>
            O2: &quot;Tiny ornamental style for subtle romantic accents.&quot;
          </Text.O2>
        </div>
      </Example.Case>
    </Example>
  );
};
