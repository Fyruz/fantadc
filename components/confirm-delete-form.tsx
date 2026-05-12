"use client";

import { useRef, useState } from "react";
import { Button } from "primereact/button";
import ConfirmDialog from "./confirm-dialog";

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
  const [visible, setVisible] = useState(false);

  return (
    <>
      <ConfirmDialog
        visible={visible}
        onHide={() => setVisible(false)}
        onConfirm={() => formRef.current?.requestSubmit()}
        message={confirmMessage}
        confirmLabel="Elimina"
        severity="danger"
      />
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
          onClick={() => setVisible(true)}
        />
      </form>
    </>
  );
}
