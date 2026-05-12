"use client";

import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";

interface Props {
  visible: boolean;
  onHide: () => void;
  onConfirm: () => void;
  message: string;
  confirmLabel?: string;
  severity?: "danger" | "warning";
}

export default function ConfirmDialog({
  visible,
  onHide,
  onConfirm,
  message,
  confirmLabel = "Sì, confermo",
  severity = "danger",
}: Props) {
  const isDanger = severity === "danger";

  const handleConfirm = () => {
    onConfirm();
    onHide();
  };

  return (
    <Dialog
      visible={visible}
      onHide={onHide}
      header={null}
      closable={false}
      style={{ width: "min(22rem, 92vw)", padding: 0 }}
      contentStyle={{ padding: 0 }}
      pt={{ root: { style: { borderRadius: "20px", overflow: "hidden" } } }}
      modal
      draggable={false}
      resizable={false}
    >
      <div className="flex flex-col items-center px-6 py-8 gap-5 text-center">
        <div
          className="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0"
          style={{ background: isDanger ? "#FEF2F2" : "rgba(232,160,0,0.12)" }}
        >
          <i
            className="pi pi-exclamation-triangle text-2xl"
            style={{ color: isDanger ? "#DC2626" : "#C87800" }}
          />
        </div>

        <p
          className="text-sm font-semibold leading-relaxed"
          style={{ color: "var(--text-primary)" }}
        >
          {message}
        </p>

        <div className="flex gap-3 w-full">
          <Button
            label="Annulla"
            severity="secondary"
            outlined
            className="flex-1"
            onClick={onHide}
          />
          <Button
            label={confirmLabel}
            severity={severity}
            className="flex-1"
            onClick={handleConfirm}
          />
        </div>
      </div>
    </Dialog>
  );
}
