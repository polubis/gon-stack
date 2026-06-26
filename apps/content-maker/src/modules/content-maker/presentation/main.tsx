import { useState } from 'react';
import type { LeafDirective } from 'mdast-util-directive';
import {
  MDXEditor,
  toolbarPlugin,
  listsPlugin,
  quotePlugin,
  headingsPlugin,
  linkPlugin,
  linkDialogPlugin,
  imagePlugin,
  tablePlugin,
  thematicBreakPlugin,
  frontmatterPlugin,
  codeBlockPlugin,
  codeMirrorPlugin,
  directivesPlugin,
  diffSourcePlugin,
  markdownShortcutPlugin,
  AdmonitionDirectiveDescriptor,
  KitchenSinkToolbar,
  type DirectiveDescriptor,
  type DirectiveEditorProps,
  type MDXEditorProps,
} from '@mdxeditor/editor';

import '@mdxeditor/editor/style.css';
import './index.css';

import markdown from '../assets/live-demo-contents.md?raw';

interface YoutubeDirectiveNode extends LeafDirective {
  name: 'youtube';
  attributes: { id: string };
}

const YoutubeEditor = ({
  mdastNode,
  lexicalNode,
  parentEditor,
}: DirectiveEditorProps<YoutubeDirectiveNode>) => (
  <div
    style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'flex-start',
    }}
  >
    <button
      onClick={() => {
        parentEditor.update(() => {
          lexicalNode.selectNext();
          lexicalNode.remove();
        });
      }}
    >
      delete
    </button>
    <iframe
      width="560"
      height="315"
      src={`https://www.youtube.com/embed/${mdastNode.attributes.id}`}
      title="YouTube video player"
      style={{ border: 0 }}
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
    />
  </div>
);

const YoutubeDirectiveDescriptor: DirectiveDescriptor<YoutubeDirectiveNode> = {
  name: 'youtube',
  type: 'leafDirective',
  testNode(node) {
    return node.name === 'youtube';
  },
  attributes: ['id'],
  hasChildren: false,
  Editor: YoutubeEditor,
};

const ALL_PLUGINS: MDXEditorProps['plugins'] = [
  toolbarPlugin({ toolbarContents: () => <KitchenSinkToolbar /> }),
  listsPlugin(),
  quotePlugin(),
  headingsPlugin({ allowedHeadingLevels: [1, 2, 3, 4, 5, 6] }),
  linkPlugin(),
  linkDialogPlugin(),
  imagePlugin({
    imageAutocompleteSuggestions: [
      'https://picsum.photos/200/300',
      'https://picsum.photos/200',
    ],
    imageUploadHandler: async () =>
      Promise.resolve('https://picsum.photos/200/300'),
  }),
  tablePlugin(),
  thematicBreakPlugin(),
  frontmatterPlugin(),
  codeBlockPlugin({ defaultCodeBlockLanguage: '' }),
  codeMirrorPlugin({
    codeBlockLanguages: {
      js: 'JavaScript',
      css: 'CSS',
      txt: 'Plain Text',
      tsx: 'TypeScript',
      '': 'Unspecified',
    },
  }),
  directivesPlugin({
    directiveDescriptors: [
      YoutubeDirectiveDescriptor,
      AdmonitionDirectiveDescriptor,
    ],
  }),
  diffSourcePlugin({ viewMode: 'rich-text', diffMarkdown: '' }),
  markdownShortcutPlugin(),
];

export const Main = () => {
  const [value, setValue] = useState(markdown);

  return (
    <MDXEditor
      markdown={value}
      plugins={ALL_PLUGINS}
      onChange={setValue}
      contentEditableClassName="prose max-w-none"
    />
  );
};
