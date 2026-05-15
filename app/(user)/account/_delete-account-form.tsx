"use client";

import { useState } from "react";
import { Button } from "primereact/button";
import DeleteAccountDialog from "@/components/delete-account-dialog";
import { deleteOwnAccount } from "@/app/actions/account";

export default function DeleteAccountForm() {
  const [visible, setVisible] = useState(false);

  const handleConfirm = async (password: string) => {
    const fd = new FormData();
    fd.append("password", password);
    const result = await deleteOwnAccount(undefined, fd);
    return { error: result?.error };
  };

  return (
    <>
      <DeleteAccountDialog
        visible={visible}
        onHide={() => setVisible(false)}
        onConfirm={handleConfirm}
        description="Questa azione è permanente e irreversibile. La tua squadra fanta e tutti i tuoi dati verranno eliminati."
      />
      <Button
        label="Elimina account"
        icon="pi pi-trash"
        severity="danger"
        outlined
        onClick={() => setVisible(true)}
      />
    </>
  );
}
