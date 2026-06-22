import { formatPuzzleDate } from './puzzles';

export function buildShareText(
  path: string[],
  score: number,
  dateStr: string,
): string {
  const rungs = path.length - 1;
  const dots = '●'.repeat(rungs);
  const start = path[0];
  const target = path[path.length - 1];
  const date = formatPuzzleDate(dateStr);

  return [
    `WORDZAPPER 🪜 — ${date}`,
    `${start} → ${target}`,
    dots,
    `Score: ${score}`,
    ``,
    `wordzapper.app`,
  ].join('\n');
}

export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}
