import {
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { randomBytes } from 'crypto';
import { Request, Response } from 'express';
import { baseCookieOptions, STATE_COOKIE } from '../cookies';

/**
 * Starts the Google authorization code flow and, on the callback,
 * validates the `state` parameter (CSRF protection) before Passport
 * exchanges the code for tokens.
 */
@Injectable()
export class GoogleAuthGuard extends AuthGuard('google') {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const http = context.switchToHttp();
    const req = http.getRequest<Request>();
    const res = http.getResponse<Response>();

    if (req.query.code || req.query.error) {
      const expected = req.cookies?.[STATE_COOKIE];
      res.clearCookie(STATE_COOKIE, baseCookieOptions());
      if (!expected || expected !== req.query.state) {
        throw new UnauthorizedException('Invalid OAuth state');
      }
    }
    return (await super.canActivate(context)) as boolean;
  }

  getAuthenticateOptions(context: ExecutionContext) {
    const http = context.switchToHttp();
    const req = http.getRequest<Request>();
    const res = http.getResponse<Response>();

    // Callback step: nothing extra to send.
    if (req.query.code || req.query.error) {
      return { session: false };
    }

    // Login step: create a random state and remember it in a short-lived cookie.
    const state = randomBytes(16).toString('hex');
    res.cookie(STATE_COOKIE, state, {
      ...baseCookieOptions(),
      maxAge: 10 * 60 * 1000,
    });
    return {
      session: false,
      state,
      scope: ['openid', 'email', 'profile'],
      prompt: 'select_account',
    };
  }
}
