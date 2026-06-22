export const TOTAL_TIME = 60;
export const RUNG_POINTS = 200;
export const TIME_BONUS_RATE = 10; // pts per second remaining
export const WRONG_PENALTY = 3;   // seconds deducted per wrong guess

export function calculateScore(rungsCompleted: number, timeLeft: number, won: boolean): number {
  const base = rungsCompleted * RUNG_POINTS;
  const bonus = won ? Math.round(timeLeft * TIME_BONUS_RATE) : 0;
  return base + bonus;
}

// Score → base G$ per day (percentile system requires real leaderboard; MVP uses score tiers)
export function getBaseGEarned(score: number): number {
  if (score >= 1000) return 0.40;
  if (score >= 700)  return 0.20;
  if (score >= 400)  return 0.10;
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

// Returns how many consecutive days the streak should be after today's play
export function updateStreak(
  currentStreak: number,
  lastPlayedDate: string | null,
  today: string,
): number {
  if (!lastPlayedDate) return 1;

  const last = new Date(lastPlayedDate + 'T12:00:00Z').getTime();
  const now  = new Date(today       + 'T12:00:00Z').getTime();
  const daysDiff = Math.round((now - last) / 86_400_000);

  if (daysDiff === 0) return currentStreak;   // same day, already updated
  if (daysDiff === 1) return currentStreak + 1;
  return 1; // streak broken
}
