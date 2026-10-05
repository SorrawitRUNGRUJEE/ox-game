import { Result } from '@prisma/client';

export const WINS_FOR_BONUS = 3;

/**
 * Scoring rules:
 *  - win  : +1 (streak + 1). The 3rd consecutive win also earns +1 bonus
 *           (+2 in total) and the streak counter starts again from 0.
 *  - loss : -1 and the streak resets to 0.
 *  - draw : 0 points and the streak is left unchanged.
 */
export function applyResult(
  currentStreak: number,
  result: Result,
): { scoreChange: number; newStreak: number } {
  if (result === Result.WIN) {
    const streak = currentStreak + 1;
    if (streak >= WINS_FOR_BONUS) {
      return { scoreChange: 2, newStreak: 0 };
    }
    return { scoreChange: 1, newStreak: streak };
  }
  if (result === Result.LOSS) {
    return { scoreChange: -1, newStreak: 0 };
  }
  return { scoreChange: 0, newStreak: currentStreak };
}
