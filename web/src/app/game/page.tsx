'use client';

import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import AppHeader from '@/components/AppHeader';
import Board from '@/components/Board';
import { api, ApiError } from '@/lib/api';
import { GameState } from '@/lib/types';
import { useRequireUser } from '@/lib/useRequireUser';

const WINS_FOR_BONUS = 3;

function statusMessage(state: GameState, busy: boolean): string {
  const game = state.game;
  if (!game) return 'Loading your game...';
  if (game.status === 'IN_PROGRESS') return busy ? 'Bot is thinking...' : 'Your move. You play X.';
  if (game.result === 'WIN') {
    return game.scoreChange === 2
      ? 'You won, and the 3-win bonus gives you +2 points.'
      : 'You won: +1 point.';
  }
  if (game.result === 'LOSS') return 'The bot won: −1 point.';
  return 'Draw: your score stays the same.';
}

export default function GamePage() {
  const router = useRouter();
  const user = useRequireUser();
  const [state, setState] = useState<GameState | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const handleError = useCallback(
    (e: unknown) => {
      if (e instanceof ApiError && e.status === 401) {
        router.replace('/');
        return;
      }
      setError(e instanceof Error ? e.message : 'Something went wrong. Please try again.');
    },
    [router],
  );

  const startGame = useCallback(async () => {
    setError('');
    try {
      setState(await api<GameState>('/game/start', { method: 'POST' }));
    } catch (e) {
      handleError(e);
    }
  }, [handleError]);

  // Resume the unfinished game, or start a new one.
  useEffect(() => {
    startGame();
  }, [startGame]);

  async function play(cell: number) {
    const game = state?.game;
    if (!game || game.status !== 'IN_PROGRESS' || busy) return;
    setBusy(true);
    setError('');
    try {
      setState(
        await api<GameState>(`/game/${game.id}/move`, {
          method: 'POST',
          body: JSON.stringify({ cell }),
        }),
      );
    } catch (e) {
      handleError(e);
      startGame(); // re-sync with the server
    } finally {
      setBusy(false);
    }
  }

  if (!user || !state || !state.game) {
    return (
      <>
        {user && <AppHeader user={user} />}
        <p className="px-5 py-10 text-center text-muted" role="status">
          {error || 'Loading...'}
        </p>
      </>
    );
  }

  const game = state.game;
  const finished = game.status === 'FINISHED';

  return (
    <>
      <AppHeader user={user} />
      <main className="mx-auto grid max-w-4xl gap-10 px-5 pb-14 pt-4 md:grid-cols-[minmax(0,420px)_1fr] md:items-start">
        <section>
          <p role="status" aria-live="polite" className="mb-4 min-h-[3.5rem] text-lg font-semibold">
            {statusMessage(state, busy)}
          </p>
          <Board board={game.board} onPlay={play} disabled={busy || finished} />
          {error && (
            <p role="alert" className="mt-4 text-sm font-semibold text-pencil">
              {error}
            </p>
          )}
        </section>

        <aside className="rounded-lg bg-white/80 p-6 ring-1 ring-grid">
          <p className="text-sm text-muted">Your score</p>
          <p className="text-7xl font-extrabold leading-none">{state.score}</p>

          <div className="mt-6">
            <div className="flex gap-2" aria-hidden="true">
              {Array.from({ length: WINS_FOR_BONUS }).map((_, i) => (
                <span
                  key={i}
                  className={`h-4 w-4 rounded-full border-2 border-ink ${
                    i < state.winStreak ? 'bg-ink' : 'bg-transparent'
                  }`}
                />
              ))}
            </div>
            <p className="mt-2 text-sm">
              {state.winStreak} of {WINS_FOR_BONUS} wins in a row toward the bonus point
            </p>
          </div>

          {finished && (
            <button
              type="button"
              onClick={startGame}
              className="mt-8 w-full rounded-md bg-ink px-5 py-3 font-semibold text-white hover:bg-ink/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pencil"
            >
              Play again
            </button>
          )}

          <dl className="mt-8 grid grid-cols-[1fr_auto] gap-x-6 gap-y-1 border-t border-grid pt-5 text-sm">
            <dt>Win</dt>
            <dd className="font-semibold">+1 point</dd>
            <dt>Lose</dt>
            <dd className="font-semibold">−1 point</dd>
            <dt>Draw</dt>
            <dd className="font-semibold">no change</dd>
            <dt>Three wins in a row</dt>
            <dd className="font-semibold">+1 bonus</dd>
          </dl>
        </aside>
      </main>
    </>
  );
}
