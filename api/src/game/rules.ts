export type Cell = 'X' | 'O' | '-';
export type Outcome = 'X' | 'O' | 'DRAW' | null;

export const EMPTY_BOARD = '---------';

export const LINES: number[][] = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6],
];

/** 'X' / 'O' if that mark has three in a row, 'DRAW' if the board is full, otherwise null. */
export function getOutcome(board: Cell[]): Outcome {
  for (const [a, b, c] of LINES) {
    if (board[a] !== '-' && board[a] === board[b] && board[a] === board[c]) {
      return board[a] as 'X' | 'O';
    }
  }
  return board.every((cell) => cell !== '-') ? 'DRAW' : null;
}
