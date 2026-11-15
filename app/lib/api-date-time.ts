// SQLiteのCURRENT_TIMESTAMPなど、タイムゾーンを持たない日時の形式
const TIMEZONE_LESS_DATE_TIME =
  /^(\d{4}-\d{2}-\d{2})[ T](\d{2}:\d{2}(?::\d{2}(?:\.\d+)?)?)$/;

/**
 * APIの日時をUTCのISO 8601へ揃える。
 * タイムゾーンのない値はUTCとして解釈する(`new Date`に渡すと端末の時刻として扱われ、日本時間では9時間ずれるため)。
 * 解釈できない値はそのまま返す。
 */
export function toUtcIsoDateTime(value: string): string {
  const match = TIMEZONE_LESS_DATE_TIME.exec(value);
  const date = new Date(match ? `${match[1]}T${match[2]}Z` : value);
  return Number.isNaN(date.getTime()) ? value : date.toISOString();
}
