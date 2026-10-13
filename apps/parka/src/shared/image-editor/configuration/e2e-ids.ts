export const IMAGE_EDITOR_E2E_IDS = [
  'image-editor:dialog',
  'image-editor:preview',
  'image-editor:zoom',
  'image-editor:rotate-left',
  'image-editor:rotate-right',
  'image-editor:cancel',
  'image-editor:confirm',
] as const;

export type ImageEditorE2eId = (typeof IMAGE_EDITOR_E2E_IDS)[number];
