import { formatPuzzleDate } from './puzzles';

export function buildShareText(
  path: string[],
  score: number,
  dateStr: string,
  gEarned?: number,
): string {
  const rungs  = Math.max(0, path.length - 1);
  const dots   = '●'.repeat(rungs);
  const start  = path[0] ?? '';
  const target = path[path.length - 1] ?? '';
  const date   = formatPuzzleDate(dateStr);
  const gLine  = gEarned ? `Earned ${gEarned.toFixed(2)} G$ 💚` : '';

  return [
    `WORDZAPPERS 🪜 — ${date}`,
    `${start} → ${target}`,
    dots,
    `Score: ${score}`,
    gLine,
    `Play & earn G$ at wordzappers.xyz`,
  ].filter(Boolean).join('\n');
}

export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}

export function buildTwitterUrl(shareText: string): string {
  return `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}`;
}

export function buildWarpcastUrl(shareText: string): string {
  return `https://warpcast.com/~/compose?text=${encodeURIComponent(shareText)}`;
}
