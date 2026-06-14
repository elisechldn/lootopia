import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { API_URL } from '@/lib/api';

export async function POST(request: Request) {
  const token = (await cookies()).get('auth_token')?.value;
  if (!token) {
    return NextResponse.json({ message: 'Non authentifié' }, { status: 401 });
  }

  const body = await request.text();
  const apiRes = await fetch(`${API_URL}/hunts`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body,
  });
  const resBody = await apiRes.text();
  return new NextResponse(resBody, {
    status: apiRes.status,
    headers: { 'Content-Type': apiRes.headers.get('content-type') ?? 'application/json' },
  });
}
