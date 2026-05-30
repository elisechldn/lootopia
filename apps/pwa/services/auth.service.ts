import { API_URL } from '@/lib/api';

export async function registerPlayer(data: {
  firstname: string;
  lastname: string;
  email: string;
  password: string;
}) {
  const res = await fetch(`${API_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      firstname: data.firstname,
      lastname: data.lastname,
      username: data.email,
      email: data.email,
      password: data.password,
      country: '',
      role: 'PLAYER',
    }),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body?.message ?? "Erreur lors de l'inscription");
  }
  return res.json();
}

export async function verifyEmailPlayer(token: string): Promise<{ access_token: string; user: { id: number; email: string; role: string; firstname: string; lastname: string } }> {
  const res = await fetch(`${API_URL}/auth/verify-email`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token }),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body?.message ?? 'Lien invalide ou expiré');
  }
  const json = await res.json();
  return json.data;
}

export async function getMyUserInfos(token: string) {
  const res = await fetch(`${API_URL}/users/me`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error('Impossible de récupérer les informations utilisateur');
  return res.json();
}
