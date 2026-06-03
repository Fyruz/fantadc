"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAppToast } from "./toast-provider";
import type { PendingMvpVote } from "@/lib/pending-mvp-votes";

export default function MvpVoteToast({ pendingVotes }: { pendingVotes: PendingMvpVote[] }) {
  const toast = useAppToast();
  const router = useRouter();

  useEffect(() => {
    if (pendingVotes.length === 0) return;

    const ids = pendingVotes.map((vote) => vote.matchId).sort((a, b) => a - b);
    const storageKey = `fantadc:mvp-toast:${ids.join(",")}`;
    if (sessionStorage.getItem(storageKey)) return;
    sessionStorage.setItem(storageKey, "shown");

    const href = pendingVotes.length === 1 ? `/vota/${pendingVotes[0].matchId}` : "/dashboard";
    const message = pendingVotes.length === 1
      ? `Votazione MVP aperta: ${pendingVotes[0].title}.`
      : `${pendingVotes.length} votazioni MVP aperte.`;

    toast.cta(message, () => router.push(href), "Vota ora");
  }, [pendingVotes, router, toast]);

  return null;
}
