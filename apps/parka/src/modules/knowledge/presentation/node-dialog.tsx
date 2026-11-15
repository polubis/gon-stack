import { useState, type FormEvent } from 'react';
import { closeModal } from '@/shared/router/modal-stack';
import { Button, Field, Select } from '@/shared/ui/controls';
import { ClearableInput, ClearableTextarea } from '@/shared/ui/clearable';
import {
  DEFAULT_PRIORITY_ID,
  NOTES_MAX_LENGTH,
  TAGS_MAX_COUNT,
  TAG_MAX_LENGTH,
  TITLE_MAX_LENGTH,
} from '../configuration/constraints';
import { newNodeId } from '../domain/ids';
import {
  parseTags,
  priorityLabel,
  STATUS_NAMES,
  STATUS_ORDER,
} from '../domain/learning';
import type {
  CategoryId,
  FolderId,
  KnowledgeNode,
  LearnStatus,
  PriorityId,
} from '../domain/models';
import { useContext } from './context';
import { ModalFrame } from './modal-frame';

const FORM = 'knowledge-node-form';

/** Add or edit a node: title, folder, category, priority, status, tags, notes. */
export const NodeDialog = ({
  modal,
  node,
  folderId,
}: {
  modal: string;
  /** The node being edited; absent when adding. */
  node?: KnowledgeNode;
  /** Folder preselected for a new node. */
  folderId?: FolderId;
}) => {
  const { folders, categories, priorities, createNode, updateNode } =
    useContext();
  const [title, setTitle] = useState(node?.title ?? '');
  const [notes, setNotes] = useState(node?.notes ?? '');
  const [tags, setTags] = useState(node?.tags.join(', ') ?? '');
  const [folder, setFolder] = useState<string>(
    node?.folderId ?? folderId ?? folders[0]?.id ?? '',
  );
  const [category, setCategory] = useState<string>(
    node?.categoryId ?? categories[0]?.id ?? '',
  );
  const [priority, setPriority] = useState<string>(
    node?.priorityId ??
      priorities.find((p) => p.id === DEFAULT_PRIORITY_ID)?.id ??
      priorities[0]?.id ??
      '',
  );
  const [status, setStatus] = useState<LearnStatus>(node?.status ?? 'to-learn');
  const valid = title.trim() !== '' && folder !== '' && category !== '';

  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (!valid) return;
    const next: KnowledgeNode = {
      id: node?.id ?? newNodeId(),
      folderId: folder as FolderId,
      title: title.trim(),
      notes: notes.trim() === '' ? null : notes.trim(),
      categoryId: category as CategoryId,
      priorityId: priority as PriorityId,
      tags: parseTags(tags, TAGS_MAX_COUNT, TAG_MAX_LENGTH),
      status,
    };
    if (node) updateNode(next);
    else createNode(next);
    closeModal(modal);
  };

  return (
    <ModalFrame
      modal={modal}
      data-e2e="knowledge:node-dialog"
      title={node ? 'Edytuj węzeł' : 'Nowy węzeł wiedzy'}
      description={
        node
          ? 'Zmień treść, folder lub priorytet nauki.'
          : 'Dodaj rzecz do nauczenia się i przypisz ją do folderu.'
      }
      footer={
        <>
          <Button
            variant="ghost"
            data-e2e="knowledge:node-cancel"
            onClick={() => closeModal(modal)}
          >
            Anuluj
          </Button>
          <Button
            type="submit"
            form={FORM}
            disabled={!valid}
            data-e2e="knowledge:node-save"
            className="disabled:opacity-50"
          >
            {node ? 'Zapisz' : 'Dodaj węzeł'}
          </Button>
        </>
      }
    >
      <form
        id={FORM}
        onSubmit={submit}
        data-e2e="knowledge:node-form"
        className="flex flex-col gap-4"
      >
        <Field label="Tytuł" required>
          <ClearableInput
            data-e2e="knowledge:node-title"
            value={title}
            maxLength={TITLE_MAX_LENGTH}
            onChange={(e) => setTitle(e.target.value)}
            autoComplete="off"
          />
        </Field>
        <Field label="Folder" required>
          <Select
            data-e2e="knowledge:node-folder"
            value={folder}
            onValueChange={setFolder}
            options={folders.map((f) => ({ value: f.id, label: f.name }))}
          />
        </Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Kategoria" required>
            <Select
              data-e2e="knowledge:node-category"
              value={category}
              onValueChange={setCategory}
              options={categories.map((c) => ({
                value: c.id,
                label: c.name,
              }))}
            />
          </Field>
          <Field label="Priorytet nauki">
            <Select
              data-e2e="knowledge:node-priority"
              value={priority}
              onValueChange={setPriority}
              options={priorities.map((p) => ({
                value: p.id,
                label: priorityLabel(p),
              }))}
            />
          </Field>
        </div>
        <Field label="Postęp">
          <Select
            data-e2e="knowledge:node-status"
            value={status}
            onValueChange={(value) => setStatus(value as LearnStatus)}
            options={STATUS_ORDER.map((s) => ({
              value: s,
              label: STATUS_NAMES[s],
            }))}
          />
        </Field>
        <Field
          label="Tagi"
          hint="Oddziel przecinkami, np. react, architektura."
        >
          <ClearableInput
            data-e2e="knowledge:node-tags"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            autoComplete="off"
          />
        </Field>
        <Field label="Notatki">
          <ClearableTextarea
            data-e2e="knowledge:node-notes"
            rows={3}
            value={notes}
            maxLength={NOTES_MAX_LENGTH}
            onChange={(e) => setNotes(e.target.value)}
          />
        </Field>
      </form>
    </ModalFrame>
  );
};
