const displayDateTimeFormatter = new Intl.DateTimeFormat("ja-JP", {
  day: "2-digit",
  hour: "2-digit",
  hour12: false,
  minute: "2-digit",
  month: "2-digit",
});

export function formatDisplayDateTime(value: string): string {
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? "—"
    : displayDateTimeFormatter.format(date);
}
