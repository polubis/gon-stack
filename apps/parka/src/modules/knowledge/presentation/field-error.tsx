/** Inline validation message, shown after the first submit try. */
export const FieldError = ({
  id,
  message,
}: {
  id: string;
  message: string | null;
}) =>
  message ? (
    <span id={id} role="alert" className="mt-1 block text-xs text-danger">
      {message}
    </span>
  ) : null;
