export function formatVolleyMatchTime(date: Date): string {
  return date.toLocaleTimeString("it-IT", { hour: "2-digit", minute: "2-digit", timeZone: "UTC" });
}

export function formatVolleyDayPill(date: Date): string {
  return date.toLocaleDateString("it-IT", { weekday: "short", day: "numeric", month: "short", timeZone: "UTC" });
}

export function formatVolleyDayHeading(date: Date): string {
  return date.toLocaleDateString("it-IT", { weekday: "long", day: "numeric", month: "long", timeZone: "UTC" });
}

export function formatVolleyDate(date: Date): string {
  return date.toLocaleDateString("it-IT", { day: "numeric", month: "short", timeZone: "UTC" });
}
