"use client";

import { useActionState } from "react";
import { useRouter } from "next/navigation";
import { InputText } from "primereact/inputtext";
import { Button } from "primereact/button";
import AdminPageHeader from "@/components/admin-page-header";
import { createVolleyGroup } from "@/app/actions/admin/volley";

export default function NuovoVolleyGironePage() {
  const [state, formAction, pending] = useActionState(createVolleyGroup, undefined);

  return (
    <div>
      <AdminPageHeader title="Nuovo girone" backHref="/admin/greenvolley/gironi" />
      <div className="admin-card p-5 max-w-lg">
        <form action={formAction} className="flex flex-col gap-4">
          {state?.error && (
            <p className="text-sm font-semibold" style={{ color: "var(--error, #dc2626)" }}>
              {state.error}
            </p>
          )}
          <div className="flex flex-col gap-1">
            <label className="text-sm font-semibold">Nome girone *</label>
            <InputText
              name="name"
              required
              className="w-full"
              placeholder="es. Girone A"
            />
          </div>
          <Button
            type="submit"
            label="Crea girone"
            loading={pending}
            style={{ background: "#3DD907", border: "none", color: "#fff" }}
          />
        </form>
      </div>
    </div>
  );
}
