"use client";

import { useRouter } from "next/navigation";

export default function BackButton() {
  const router = useRouter();
  return (
    <button
      onClick={() => router.back()}
      className="flex items-center justify-center w-9 h-9 rounded-full"
      style={{ background: "rgba(9,20,76,0.06)" }}
      aria-label="Indietro"
    >
      <img src="/icons/chevron_left.svg" width={20} height={20} alt="" />
    </button>
  );
}
