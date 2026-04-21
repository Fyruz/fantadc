export type BasicActionResult = {
  errors?: Record<string, string[]>;
  message?: string;
};

export function isSuccessfulActionResult(
  result: BasicActionResult | undefined
): boolean {
  return !!result && !result.message && !result.errors;
}
