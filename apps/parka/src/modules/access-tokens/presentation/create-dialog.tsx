import { useEffect, useRef, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { closeModal } from '@/shared/router/modal-stack';
import { Button, Field, Select } from '@/shared/ui/controls';
import { ClearableInput } from '@/shared/ui/clearable';
import {
  DEFAULT_TTL,
  NAME_MAX_LENGTH,
  TTL_OPTIONS,
} from '../configuration/constraints';
import { useContext } from './context';
import { ModalShell } from './modal-shell';

const toTtlDays = (value: string): number | null =>
  value === 'never' ? null : Number(value);

/** Name + lifetime of a new token; closes itself once the server has answered. */
export const CreateDialog = ({ modal }: { modal: string }) => {
  const ctx = useContext();
  const creating = ctx.useIsCreating();
  const [name, setName] = useState('');
  const [ttl, setTtl] = useState(DEFAULT_TTL);
  const submitted = useRef(false);
  const canSave = name.trim() !== '' && !creating;

  useEffect(() => {
    if (submitted.current && !creating) closeModal(modal);
  }, [creating, modal]);

  return (
    <ModalShell
      modal={modal}
      data-e2e="access-tokens:form"
      title="Nowy token"
      description="Token daje asystentowi AI dostęp do Twoich zadań i wydatków."
    >
      <form
        className="grid gap-3"
        onSubmit={(e) => {
          e.preventDefault();
          if (!canSave) return;
          submitted.current = true;
          ctx.create(name.trim(), toTtlDays(ttl));
        }}
      >
        <Field label="Nazwa" hint="Np. nazwa aplikacji, z której korzystasz.">
          <ClearableInput
            value={name}
            maxLength={NAME_MAX_LENGTH}
            autoComplete="off"
            autoFocus
            data-e2e="access-tokens:name"
            onChange={(e) => setName(e.target.value)}
          />
        </Field>
        <Field
          label="Ważność"
          hint="Po tym czasie token przestanie działać sam."
        >
          <Select
            options={[...TTL_OPTIONS]}
            value={ttl}
            onValueChange={setTtl}
            data-e2e="access-tokens:ttl"
          />
        </Field>
        <Button
          type="submit"
          data-e2e="access-tokens:submit"
          disabled={!canSave}
          aria-busy={creating}
        >
          {creating ? (
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
          ) : null}
          Generuj token
        </Button>
      </form>
    </ModalShell>
  );
};
