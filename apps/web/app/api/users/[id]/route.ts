import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { API_URL } from '@/lib/api';

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const token = (await cookies()).get('auth_token')?.value;
  if (!token) {
    return NextResponse.json({ message: 'Non authentifié' }, { status: 401 });
  }

  const body = await request.text();
  const apiRes = await fetch(`${API_URL}/users/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body,
  });
  const resBody = await apiRes.text();
  return new NextResponse(resBody, {
    status: apiRes.status,
    headers: { 'Content-Type': apiRes.headers.get('content-type') ?? 'application/json' },
  });
}
