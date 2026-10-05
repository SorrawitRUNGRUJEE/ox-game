import { Controller, Get, Post, Res, UseGuards } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { User } from '@prisma/client';
import { Response } from 'express';
import { baseCookieOptions, SESSION_COOKIE } from './cookies';
import { CurrentUser } from './current-user.decorator';
import { GoogleAuthGuard } from './guards/google-auth.guard';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

const SESSION_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;

@Controller('auth')
export class AuthController {
  constructor(
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
  ) {}

  /** Step 1: redirects the browser to Google's consent screen. */
  @Get('google')
  @UseGuards(GoogleAuthGuard)
  login() {
    // The guard performs the redirect.
  }

  /** Step 2: Google redirects back here with ?code=...&state=... */
  @Get('google/callback')
  @UseGuards(GoogleAuthGuard)
  callback(@CurrentUser() user: User, @Res() res: Response) {
    const token = this.jwt.sign({ sub: user.id });
    res.cookie(SESSION_COOKIE, token, {
      ...baseCookieOptions(),
      maxAge: SESSION_MAX_AGE_MS,
    });
    res.redirect(`${this.config.getOrThrow<string>('WEB_URL')}/game`);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  me(@CurrentUser() user: User) {
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      score: user.score,
      winStreak: user.winStreak,
    };
  }

  @Post('logout')
  logout(@Res({ passthrough: true }) res: Response) {
    res.clearCookie(SESSION_COOKIE, baseCookieOptions());
    return { ok: true };
  }
}
