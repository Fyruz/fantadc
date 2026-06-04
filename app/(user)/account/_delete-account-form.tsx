"use client";

import { useState } from "react";
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
      <button
        type="button"
        onClick={() => setVisible(true)}
        className="w-full flex items-center justify-center py-2 rounded-xl text-sm font-semibold text-white"
        style={{ background: "#DC2626" }}
      >
        Elimina account
      </button>
    </>
  );
}
