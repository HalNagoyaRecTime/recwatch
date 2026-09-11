/**
 * 「学籍番号 氏名」のようにスペース区切りで先頭にIDが含まれる表示名から、
 * 氏名部分だけを取り出す。スペースが無い場合はそのまま返す。
 */
export function extractPersonName(displayName: string): string {
  const match = displayName.match(/^\S+\s+(.+)$/);
  return match ? match[1].trim() : displayName;
}
