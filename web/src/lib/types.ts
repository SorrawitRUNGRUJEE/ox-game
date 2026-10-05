export type Me = {
  id: string;
  name: string;
  email: string;
  role: 'PLAYER' | 'ADMIN';
  score: number;
  winStreak: number;
};

export type GameView = {
  id: string;
  board: string[]; // 9 items: 'X' (you), 'O' (bot) or '-' (empty)
  status: 'IN_PROGRESS' | 'FINISHED';
  result: 'WIN' | 'LOSS' | 'DRAW' | null;
  scoreChange: number | null;
};

export type GameState = {
  score: number;
  winStreak: number;
  game: GameView | null;
};

export type PlayerRow = {
  id: string;
  name: string;
  email: string;
  role: 'PLAYER' | 'ADMIN';
  score: number;
  winStreak: number;
  wins: number;
  losses: number;
  draws: number;
  createdAt: string;
};
