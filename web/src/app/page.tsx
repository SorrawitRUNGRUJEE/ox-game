'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Board from '@/components/Board';
import { api } from '@/lib/api';

// A finished example game shown on the login page.
const DEMO_BOARD = ['X', 'O', '-', 'O', 'X', '-', '-', '-', 'X'];

function GoogleLogo() {
  return (
    <svg viewBox="0 0 48 48" className="h-5 w-5" aria-hidden="true">
      <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
      <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
      <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
      <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
    </svg>
  );
}

export default function LoginPage() {
  const router = useRouter();

  // Already signed in? Go straight to the game.
  useEffect(() => {
    api('/auth/me')
      .then(() => router.replace('/game'))
      .catch(() => undefined);
  }, [router]);

  return (
    <main className="mx-auto grid min-h-screen max-w-4xl items-center gap-10 px-5 py-12 md:grid-cols-2">
      <section>
        <h1 className="text-5xl font-extrabold leading-[1.05] tracking-tight sm:text-6xl">
          Beat the bot. Keep your streak.
        </h1>
        <p className="mt-5 max-w-[44ch] text-lg text-muted">
          Sign in with Google to play tic-tac-toe against the bot. Your score is saved to your account.
        </p>

        <a
          href="/api/auth/google"
          className="mt-8 inline-flex items-center gap-3 rounded-md bg-white px-5 py-3 font-semibold text-slate-800 shadow-sm ring-1 ring-grid hover:bg-slate-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pencil"
        >
          <GoogleLogo />
          Sign in with Google
        </a>

        <dl className="mt-10 grid max-w-xs grid-cols-[1fr_auto] gap-x-6 gap-y-1 text-sm">
          <dt>Win</dt>
          <dd className="font-semibold">+1 point</dd>
          <dt>Lose</dt>
          <dd className="font-semibold">−1 point</dd>
          <dt>Draw</dt>
          <dd className="font-semibold">no change</dd>
          <dt>Three wins in a row</dt>
          <dd className="font-semibold">+1 bonus</dd>
        </dl>
      </section>

      <section className="flex justify-center md:justify-end" aria-label="Example game">
        <Board board={DEMO_BOARD} onPlay={() => undefined} disabled />
      </section>
    </main>
  );
}
