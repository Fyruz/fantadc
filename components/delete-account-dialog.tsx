"use client";

import { useState } from "react";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { Password } from "primereact/password";

interface Props {
  visible: boolean;
  onHide: () => void;
  onConfirm: (password: string) => Promise<{ error?: string }>;
  description: string;
  requirePassword?: boolean;
}

export default function DeleteAccountDialog({
  visible,
  onHide,
  onConfirm,
  description,
  requirePassword = true,
}: Props) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const handleHide = () => {
    if (pending) return;
    setPassword("");
    setError(null);
    onHide();
  };

  const handleConfirm = async () => {
    if (requirePassword && !password) { setError("Inserisci la password."); return; }
    setPending(true);
    setError(null);
    const result = await onConfirm(password);
    if (result.error) {
      setError(result.error);
      setPending(false);
    }
    // Se successo, la server action fa redirect — non serve reset
  };

  return (
    <Dialog
      visible={visible}
      onHide={handleHide}
      header={null}
      closable={!pending}
      style={{ width: "min(24rem, 92vw)", padding: 0 }}
      contentStyle={{ padding: 0 }}
      pt={{ root: { style: { borderRadius: "20px", overflow: "hidden" } } }}
      modal
      draggable={false}
      resizable={false}
    >
      <div className="flex flex-col px-6 py-8 gap-5">
        {/* Icon + title */}
        <div className="flex flex-col items-center gap-3 text-center">
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0"
            style={{ background: "#FEF2F2" }}
          >
            <i className="pi pi-trash text-2xl" style={{ color: "#DC2626" }} />
          </div>
          <div>
            <p
              className="font-display font-black text-base uppercase"
              style={{ color: "var(--text-primary)" }}
            >
              Elimina account
            </p>
            <p className="text-sm mt-1 leading-relaxed" style={{ color: "var(--text-muted)" }}>
              {description}
            </p>
          </div>
        </div>

        {requirePassword ? (
          <div>
            <label
              className="block text-xs font-bold uppercase tracking-wide mb-1.5"
              style={{ color: "var(--text-muted)" }}
            >
              Conferma con la tua password
            </label>
            <Password
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              feedback={false}
              toggleMask
              className="w-full"
              inputClassName="w-full"
              placeholder="••••••••"
              autoComplete="current-password"
              disabled={pending}
            />
            {error && (
              <p className="text-xs mt-1.5" style={{ color: "#DC2626" }}>
                {error}
              </p>
            )}
          </div>
        ) : error ? (
          <p className="text-xs text-center" style={{ color: "#DC2626" }}>
            {error}
          </p>
        ) : null}

        {/* Actions */}
        <div className="flex gap-3">
          <Button
            label="Annulla"
            severity="secondary"
            outlined
            className="flex-1"
            onClick={handleHide}
            disabled={pending}
          />
          <Button
            label={pending ? "Eliminazione..." : "Sì, elimina"}
            severity="danger"
            className="flex-1"
            onClick={handleConfirm}
            disabled={pending}
          />
        </div>
      </div>
    </Dialog>
  );
}
