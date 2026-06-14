import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { API_URL } from '@/lib/api';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const token = (await cookies()).get('auth_token')?.value;
  if (!token) {
    return NextResponse.json({ message: 'Non authentifié' }, { status: 401 });
  }

  const apiRes = await fetch(`${API_URL}/ar-items/${id}/usage`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const body = await apiRes.text();
  return new NextResponse(body, {
    status: apiRes.status,
    headers: { 'Content-Type': apiRes.headers.get('content-type') ?? 'application/json' },
  });
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const token = (await cookies()).get('auth_token')?.value;
  if (!token) {
    return NextResponse.json({ message: 'Non authentifié' }, { status: 401 });
  }

  const apiRes = await fetch(`${API_URL}/ar-items/${id}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  });
  const body = await apiRes.text();
  return new NextResponse(body, {
    status: apiRes.status,
    headers: { 'Content-Type': apiRes.headers.get('content-type') ?? 'application/json' },
  });
}
