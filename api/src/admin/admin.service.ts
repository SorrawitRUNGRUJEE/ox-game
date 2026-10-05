import { Injectable } from '@nestjs/common';
import { GameStatus, Result } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AdminService {
  constructor(private readonly prisma: PrismaService) {}

  async listPlayers() {
    const [users, stats] = await Promise.all([
      this.prisma.user.findMany({
        orderBy: [{ score: 'desc' }, { createdAt: 'asc' }],
      }),
      this.prisma.game.groupBy({
        by: ['userId', 'result'],
        where: { status: GameStatus.FINISHED },
        _count: { _all: true },
      }),
    ]);

    const counts = new Map<string, Record<Result, number>>();
    for (const row of stats) {
      if (!row.result) continue;
      const entry =
        counts.get(row.userId) ?? { [Result.WIN]: 0, [Result.LOSS]: 0, [Result.DRAW]: 0 };
      entry[row.result] = row._count._all;
      counts.set(row.userId, entry);
    }

    return users.map((u) => {
      const c = counts.get(u.id) ?? { [Result.WIN]: 0, [Result.LOSS]: 0, [Result.DRAW]: 0 };
      return {
        id: u.id,
        name: u.name,
        email: u.email,
        role: u.role,
        score: u.score,
        winStreak: u.winStreak,
        wins: c.WIN,
        losses: c.LOSS,
        draws: c.DRAW,
        createdAt: u.createdAt,
      };
    });
  }
}
