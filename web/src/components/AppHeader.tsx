'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { Me } from '@/lib/types';

export default function AppHeader({ user }: { user: Me }) {
  const router = useRouter();
  const pathname = usePathname();

  async function logout() {
    try {
      await api('/auth/logout', { method: 'POST' });
    } finally {
      router.replace('/');
    }
  }

  return (
    <header className="mx-auto flex max-w-4xl items-center justify-between gap-4 px-5 py-4">
      <Link href="/game" className="text-2xl font-extrabold tracking-tight" aria-label="OX home">
        <span className="text-pencil">O</span>
        <span>X</span>
      </Link>
      <nav className="flex items-center gap-4 text-sm">
        <span className="hidden max-w-[16ch] truncate font-medium sm:inline" title={user.email}>
          {user.name}
        </span>
        {pathname !== '/game' && (
          <Link href="/game" className="font-semibold underline underline-offset-4">
            Back to game
          </Link>
        )}
        {user.role === 'ADMIN' && pathname !== '/admin' && (
          <Link href="/admin" className="font-semibold underline underline-offset-4">
            All scores
          </Link>
        )}
        <button
          type="button"
          onClick={logout}
          className="rounded-md px-3 py-1.5 font-semibold ring-1 ring-ink/30 hover:bg-white"
        >
          Log out
        </button>
      </nav>
    </header>
  );
}
