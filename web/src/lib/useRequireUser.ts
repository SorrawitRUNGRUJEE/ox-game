'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { api } from './api';
import { Me } from './types';

/** Returns the signed-in user, or sends the visitor back to the login page. */
export function useRequireUser(): Me | null {
  const router = useRouter();
  const [user, setUser] = useState<Me | null>(null);

  useEffect(() => {
    api<Me>('/auth/me')
      .then(setUser)
      .catch(() => router.replace('/'));
  }, [router]);

  return user;
}
