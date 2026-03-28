"use client";

interface Props {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  action: (formData: FormData) => any;
  hiddenInputs: Record<string, string | number>;
  confirmMessage: string;
  buttonLabel?: string;
  buttonClassName?: string;
  formClassName?: string;
}

export default function ConfirmDeleteForm({
  action,
  hiddenInputs,
  confirmMessage,
  buttonLabel = "Elimina",
  buttonClassName = "text-red-500 hover:underline text-xs",
  formClassName,
}: Props) {
  return (
    <form action={action} className={formClassName}>
      {Object.entries(hiddenInputs).map(([name, value]) => (
        <input key={name} type="hidden" name={name} value={String(value)} />
      ))}
      <button
        type="submit"
        className={buttonClassName}
        onClick={(e) => {
          if (!confirm(confirmMessage)) e.preventDefault();
        }}
      >
        {buttonLabel}
      </button>
    </form>
  );
}
