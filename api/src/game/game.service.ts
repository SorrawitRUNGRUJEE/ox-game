import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Game, GameStatus, Result, User } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { chooseBotMove } from './bot';
import { Cell, getOutcome } from './rules';
import { applyResult } from './scoring';

export interface GameState {
  score: number;
  winStreak: number;
  game: {
    id: string;
    board: string[];
    status: GameStatus;
    result: Result | null;
    scoreChange: number | null;
  } | null;
}

@Injectable()
export class GameService {
  constructor(private readonly prisma: PrismaService) {}

  private toState(
    user: Pick<User, 'score' | 'winStreak'>,
    game: Game | null,
  ): GameState {
    return {
      score: user.score,
      winStreak: user.winStreak,
      game: game && {
        id: game.id,
        board: game.board.split(''),
        status: game.status,
        result: game.result,
        scoreChange: game.scoreChange,
      },
    };
  }

  /** The player's unfinished game (if any) plus their score. */
  async state(user: User): Promise<GameState> {
    const game = await this.prisma.game.findFirst({
      where: { userId: user.id, status: GameStatus.IN_PROGRESS },
      orderBy: { createdAt: 'desc' },
    });
    return this.toState(user, game);
  }

  /** Starts a new game, or resumes the unfinished one. */
  async start(user: User): Promise<GameState> {
    let game = await this.prisma.game.findFirst({
      where: { userId: user.id, status: GameStatus.IN_PROGRESS },
      orderBy: { createdAt: 'desc' },
    });
    if (!game) {
      game = await this.prisma.game.create({ data: { userId: user.id } });
    }
    return this.toState(user, game);
  }

  /**
   * Player (X) plays `cell`; the bot (O) answers. The whole game lives on the
   * server, so the client can never submit a made-up result or score.
   */
  async move(user: User, gameId: string, cell: number): Promise<GameState> {
    const game = await this.prisma.game.findFirst({
      where: { id: gameId, userId: user.id },
    });
    if (!game) throw new NotFoundException('Game not found');
    if (game.status === GameStatus.FINISHED) {
      throw new BadRequestException('This game is already finished');
    }

    const board = game.board.split('') as Cell[];
    if (board[cell] !== '-') {
      throw new BadRequestException('That cell is already taken');
    }

    board[cell] = 'X';
    let outcome = getOutcome(board);
    if (!outcome) {
      board[chooseBotMove(board)] = 'O';
      outcome = getOutcome(board);
    }
    const newBoard = board.join('');

    // Game continues
    if (!outcome) {
      const updated = await this.prisma.game.updateMany({
        where: { id: game.id, board: game.board, status: GameStatus.IN_PROGRESS },
        data: { board: newBoard },
      });
      if (updated.count !== 1) {
        throw new ConflictException('The board changed, please try again');
      }
      return this.toState(user, { ...game, board: newBoard });
    }

    // Game finished: save the result and update the score in one transaction
    const result =
      outcome === 'X' ? Result.WIN : outcome === 'O' ? Result.LOSS : Result.DRAW;

    return this.prisma.$transaction(async (tx) => {
      const current = await tx.user.findUniqueOrThrow({ where: { id: user.id } });
      const { scoreChange, newStreak } = applyResult(current.winStreak, result);

      const finishedAt = new Date();
      const updated = await tx.game.updateMany({
        where: { id: game.id, board: game.board, status: GameStatus.IN_PROGRESS },
        data: {
          board: newBoard,
          status: GameStatus.FINISHED,
          result,
          scoreChange,
          finishedAt,
        },
      });
      if (updated.count !== 1) {
        throw new ConflictException('The board changed, please try again');
      }

      const updatedUser = await tx.user.update({
        where: { id: user.id },
        data: { score: { increment: scoreChange }, winStreak: newStreak },
      });

      return this.toState(updatedUser, {
        ...game,
        board: newBoard,
        status: GameStatus.FINISHED,
        result,
        scoreChange,
        finishedAt,
      });
    });
  }
}
