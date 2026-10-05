import { Cell, LINES } from './rules';

/**
 * Chance that the bot plays "smart" on a given move. Otherwise it plays a random
 * empty cell. Kept below 1 on purpose so the player can actually win.
 */
export const BOT_SMART_CHANCE = 0.6;

/** Finds the empty cell that would complete a line for `mark`, if any. */
function findCompletingCell(board: Cell[], mark: Cell): number | null {
  for (const line of LINES) {
    const cells = line.map((i) => board[i]);
    const marks = cells.filter((c) => c === mark).length;
    const empties = cells.filter((c) => c === '-').length;
    if (marks === 2 && empties === 1) {
      return line[cells.indexOf('-')];
    }
  }
  return null;
}

/** The bot plays 'O'. Returns the index (0-8) of the cell it chooses. */
export function chooseBotMove(board: Cell[]): number {
  if (Math.random() < BOT_SMART_CHANCE) {
    const win = findCompletingCell(board, 'O');
    if (win !== null) return win;
    const block = findCompletingCell(board, 'X');
    if (block !== null) return block;
    if (board[4] === '-') return 4;
  }
  const empty = board
    .map((cell, i) => (cell === '-' ? i : -1))
    .filter((i) => i >= 0);
  return empty[Math.floor(Math.random() * empty.length)];
}
