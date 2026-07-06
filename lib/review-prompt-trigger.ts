export const REVIEW_PROMPT_OPEN_EVENT = "fantadc:review-prompt:open";

export function openReviewPrompt() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(REVIEW_PROMPT_OPEN_EVENT));
  }
}
