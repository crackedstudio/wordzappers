export const WRONG_PENALTY   = 3;    // seconds deducted per wrong guess
export const TIME_BONUS_RATE = 10;   // pts per second remaining

// Scale time and points by word length so 6-letter puzzles feel fair
export function getTimeLimit(wordLen: number): number {
  if (wordLen <= 4) return 60;
  if (wordLen <= 5) return 80;
  return 100;
}

export function getRungPoints(wordLen: number): number {
  if (wordLen <= 4) return 200;
  if (wordLen <= 5) return 350;
  return 500;
}

export function calculateScore(
  rungsCompleted: number,
  timeLeft: number,
  won: boolean,
  wordLen = 4,
): number {
  const base  = rungsCompleted * getRungPoints(wordLen);
  const bonus = won ? Math.round(timeLeft * TIME_BONUS_RATE) : 0;
  return base + bonus;
}

// G$ tiers scale up: 6-letter expert puzzles reward more
export function getBaseGEarned(score: number): number {
  if (score >= 3000) return 0.40;
  if (score >= 2000) return 0.30;
  if (score >= 1200) return 0.20;
  if (score >= 600)  return 0.12;
  return 0.05;
}

export function getStreakMultiplier(streak: number): number {
  if (streak >= 30) return 1.5;
  if (streak >= 7)  return 1.25;
  if (streak >= 3)  return 1.1;
  return 1.0;
}

export function computeGEarned(score: number, streak: number): number {
  const base = getBaseGEarned(score);
  const mult = getStreakMultiplier(streak);
  return Math.min(1.0, parseFloat((base * mult).toFixed(2)));
}

export function updateStreak(
  currentStreak: number,
  lastPlayedDate: string | null,
  today: string,
): number {
  if (!lastPlayedDate) return 1;
  const last = new Date(lastPlayedDate + 'T12:00:00Z').getTime();
  const now  = new Date(today         + 'T12:00:00Z').getTime();
  const daysDiff = Math.round((now - last) / 86_400_000);
  if (daysDiff === 0) return currentStreak;
  if (daysDiff === 1) return currentStreak + 1;
  return 1;
}
