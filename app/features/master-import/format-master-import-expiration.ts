const importExpirationFormatter = new Intl.DateTimeFormat("ja-JP", {
  day: "2-digit",
  hour: "2-digit",
  hour12: false,
  minute: "2-digit",
  month: "2-digit",
  timeZone: "Asia/Tokyo",
  year: "numeric",
});

export function formatMasterImportExpiration(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "確認期限を取得できません";

  const parts = Object.fromEntries(
    importExpirationFormatter
      .formatToParts(date)
      .filter((part) => part.type !== "literal")
      .map((part) => [part.type, part.value])
  );

  return `${parts.year}年${Number(parts.month)}月${Number(parts.day)}日 ${parts.hour}:${parts.minute}まで`;
}
