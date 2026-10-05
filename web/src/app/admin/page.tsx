'use client';

import { useCallback, useEffect, useState } from 'react';
import AppHeader from '@/components/AppHeader';
import { api, ApiError } from '@/lib/api';
import { PlayerRow } from '@/lib/types';
import { useRequireUser } from '@/lib/useRequireUser';

export default function AdminPage() {
  const user = useRequireUser();
  const [players, setPlayers] = useState<PlayerRow[] | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      setPlayers(await api<PlayerRow[]>('/admin/players'));
    } catch (e) {
      setError(
        e instanceof ApiError && e.status === 403
          ? 'This page is only for admins.'
          : 'Could not load the scores. Please try again.',
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (user?.role === 'ADMIN') load();
  }, [user, load]);

  if (!user) {
    return (
      <p className="px-5 py-10 text-center text-muted" role="status">
        Loading...
      </p>
    );
  }

  return (
    <>
      <AppHeader user={user} />
      <main className="mx-auto max-w-4xl px-5 pb-14 pt-4">
        <div className="mb-5 flex items-center justify-between gap-4">
          <h1 className="text-3xl font-extrabold tracking-tight">All players</h1>
          {user.role === 'ADMIN' && (
            <button
              type="button"
              onClick={load}
              disabled={loading}
              className="rounded-md px-3 py-1.5 text-sm font-semibold ring-1 ring-ink/30 hover:bg-white disabled:opacity-50"
            >
              {loading ? 'Refreshing...' : 'Refresh'}
            </button>
          )}
        </div>

        {user.role !== 'ADMIN' && (
          <p role="alert" className="font-semibold text-pencil">
            This page is only for admins.
          </p>
        )}
        {error && user.role === 'ADMIN' && (
          <p role="alert" className="font-semibold text-pencil">
            {error}
          </p>
        )}

        {players && players.length === 0 && (
          <p className="text-muted">No players yet. Scores appear here after someone signs in and plays.</p>
        )}

        {players && players.length > 0 && (
          <div className="overflow-x-auto rounded-lg bg-white/80 ring-1 ring-grid">
            <table className="w-full min-w-[560px] text-left text-sm">
              <thead className="border-b border-grid text-muted">
                <tr>
                  <th className="px-4 py-3 font-medium">Player</th>
                  <th className="px-4 py-3 text-right font-medium">Score</th>
                  <th className="px-4 py-3 text-right font-medium">Win streak</th>
                  <th className="px-4 py-3 text-right font-medium">Wins</th>
                  <th className="px-4 py-3 text-right font-medium">Losses</th>
                  <th className="px-4 py-3 text-right font-medium">Draws</th>
                </tr>
              </thead>
              <tbody>
                {players.map((p) => (
                  <tr key={p.id} className="border-b border-grid/70 last:border-0">
                    <td className="px-4 py-3">
                      <div className="font-semibold">{p.name}</div>
                      <div className="text-muted">{p.email}</div>
                    </td>
                    <td className="px-4 py-3 text-right text-lg font-extrabold">{p.score}</td>
                    <td className="px-4 py-3 text-right">{p.winStreak}</td>
                    <td className="px-4 py-3 text-right">{p.wins}</td>
                    <td className="px-4 py-3 text-right">{p.losses}</td>
                    <td className="px-4 py-3 text-right">{p.draws}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </>
  );
}
