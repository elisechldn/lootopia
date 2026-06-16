'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export async function handleUnauthorized(res: Response): Promise<void> {
  if (res.status === 401) {
    (await cookies()).delete('auth_token');
    redirect('/login');
  }
}
