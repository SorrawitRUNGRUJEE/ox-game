import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { User } from '@prisma/client';
import { CurrentUser } from '../auth/current-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { MoveDto } from './dto/move.dto';
import { GameService } from './game.service';

@Controller('game')
@UseGuards(JwtAuthGuard)
export class GameController {
  constructor(private readonly game: GameService) {}

  @Get('state')
  state(@CurrentUser() user: User) {
    return this.game.state(user);
  }

  @Post('start')
  start(@CurrentUser() user: User) {
    return this.game.start(user);
  }

  @Post(':id/move')
  move(
    @CurrentUser() user: User,
    @Param('id') id: string,
    @Body() dto: MoveDto,
  ) {
    return this.game.move(user, id, dto.cell);
  }
}
