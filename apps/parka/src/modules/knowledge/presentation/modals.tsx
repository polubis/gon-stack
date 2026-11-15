import { useEffect } from 'react';
import { closeModal, useModalStack } from '@/shared/router/modal-stack';
import { useContext } from './context';
import { DeleteDialog } from './delete-dialog';
import { FolderDialog } from './folder-dialog';
import {
  deletedNodeOf,
  editedNodeOf,
  newNodeFolderOf,
  NEW_FOLDER_MODAL,
  NEW_NODE_MODAL,
} from './modal-ids';
import { NodeDialog } from './node-dialog';

/** Renders the popups that are open in the URL stack, in their order. */
export const Modals = () => {
  const { nodes, initializing, deleteNode } = useContext();
  const stack = useModalStack();

  // A popup of a node that is gone (stale link) must not linger in the URL.
  const dangling = initializing
    ? undefined
    : stack.find((modal) => {
        const id = editedNodeOf(modal) ?? deletedNodeOf(modal);
        return id !== null && !nodes.some((n) => n.id === id);
      });
  useEffect(() => {
    if (dangling) closeModal(dangling);
  }, [dangling]);

  // Nothing to edit before the data is here.
  if (initializing) return null;

  return stack.map((modal) => {
    if (modal === NEW_NODE_MODAL)
      return <NodeDialog key={modal} modal={modal} />;
    if (modal === NEW_FOLDER_MODAL) return <FolderDialog key={modal} />;
    const folderId = newNodeFolderOf(modal);
    if (folderId)
      return <NodeDialog key={modal} modal={modal} folderId={folderId} />;
    const edited = editedNodeOf(modal);
    const editedNode = nodes.find((n) => n.id === edited);
    if (editedNode)
      return <NodeDialog key={modal} modal={modal} node={editedNode} />;
    const deleted = deletedNodeOf(modal);
    const deletedNode = nodes.find((n) => n.id === deleted);
    if (deletedNode)
      return (
        <DeleteDialog
          key={modal}
          modal={modal}
          node={deletedNode}
          onConfirm={() => deleteNode(deletedNode.id)}
        />
      );
    return null;
  });
};
