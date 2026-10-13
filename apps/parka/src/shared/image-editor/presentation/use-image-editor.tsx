import { useEffect, useEffectEvent, useState, type ReactNode } from 'react';
import { validateAvatarFile } from '@/shared/avatar/domain/validate-avatar-file';
import { closeModal, openModal, useModal } from '@/shared/router/modal-stack';
import { ImageEditor } from './image-editor';

/**
 * Puts the image editor between picking a file and using it. A valid image
 * opens the editor and `onDone` gets the edited file; anything else goes on
 * untouched, so the caller reports its own error as before.
 */
export const useImageEditor = (
  key: string,
  onDone: (file: File) => void,
): { select: (file: File) => void; editor: ReactNode } => {
  const modal = `image-editor:${key}`;
  const { isOpen } = useModal(modal);
  const [file, setFile] = useState<File | null>(null);

  // A reloaded or deep-linked URL has no picked file to edit.
  const dropStale = useEffectEvent(() => {
    if (isOpen) closeModal(modal);
  });
  useEffect(() => dropStale(), []);

  const finish = (next: File | null) => {
    closeModal(modal);
    setFile(null);
    if (next) onDone(next);
  };

  return {
    select: (picked) => {
      validateAvatarFile(picked).then((reason) => {
        if (reason) return onDone(picked);
        setFile(picked);
        openModal(modal);
      });
    },
    editor:
      isOpen && file ? (
        <ImageEditor
          modal={modal}
          file={file}
          onConfirm={finish}
          onCancel={(reason) => finish(reason === 'undecodable' ? file : null)}
        />
      ) : null,
  };
};
