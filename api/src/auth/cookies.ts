import { CookieOptions } from 'express';

export const SESSION_COOKIE = 'token';
export const STATE_COOKIE = 'oauth_state';

export function isSecure(): boolean {
  return (process.env.WEB_URL ?? '').startsWith('https');
}

export function baseCookieOptions(): CookieOptions {
  return { httpOnly: true, sameSite: 'lax', secure: isSecure(), path: '/' };
}
