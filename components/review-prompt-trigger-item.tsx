"use client";

import { openReviewPrompt } from "@/lib/review-prompt-trigger";

export default function ReviewPromptTriggerItem() {
  return (
    <button type="button" onClick={openReviewPrompt} className="flex items-center gap-3">
      <span className="shrink-0 w-4.5 h-4.5 flex items-center justify-center">
        <img src="/icons/star.svg" width={18} height={18} alt="" />
      </span>
      <span className="text-base text-black" style={{ lineHeight: "26px" }}>Lascia una recensione</span>
    </button>
  );
}
