"use client";
import { useRef } from "react";
import { confirmPopup, ConfirmPopup } from "primereact/confirmpopup";
import { Button } from "primereact/button";

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
  buttonClassName,
  formClassName,
}: Props) {
  const formRef = useRef<HTMLFormElement>(null);

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    confirmPopup({
      target: e.currentTarget,
      message: confirmMessage,
      icon: "pi pi-exclamation-triangle",
      acceptLabel: "Sì",
      rejectLabel: "No",
      accept: () => formRef.current?.requestSubmit(),
    });
  };

  return (
    <>
      <ConfirmPopup />
      <form ref={formRef} action={action} className={formClassName}>
        {Object.entries(hiddenInputs).map(([name, value]) => (
          <input key={name} type="hidden" name={name} value={String(value)} />
        ))}
        <Button
          type="button"
          label={buttonLabel}
          severity="danger"
          text
          size="small"
          className={buttonClassName}
          onClick={handleClick}
        />
      </form>
    </>
  );
}
