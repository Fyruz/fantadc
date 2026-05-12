"use client";

import { useRef, useState, useEffect, useActionState } from "react";
import { Button } from "primereact/button";
import ConfirmDialog from "./confirm-dialog";
import { useAppToast } from "./toast-provider";

type ActionResult = { message?: string; errors?: Record<string, string[]> };

interface Props {
  action: (_prev: ActionResult | undefined, formData: FormData) => Promise<ActionResult>;
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
  const [state, formAction, pending] = useActionState(action, undefined);
  const { error } = useAppToast();

  useEffect(() => {
    if (state?.message) error(state.message);
  }, [state]);

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
      <form ref={formRef} action={formAction} className={formClassName}>
        {Object.entries(hiddenInputs).map(([name, value]) => (
          <input key={name} type="hidden" name={name} value={String(value)} />
        ))}
        <Button
          type="button"
          label={buttonLabel}
          severity="danger"
          text
          size="small"
          loading={pending}
          className={buttonClassName}
          onClick={() => setVisible(true)}
        />
      </form>
    </>
  );
}
