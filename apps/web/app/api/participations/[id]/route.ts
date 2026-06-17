import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { API_URL } from '@/lib/api';

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const token = (await cookies()).get('auth_token')?.value;
  if (!token) {
    return NextResponse.json({ message: 'Non authentifié' }, { status: 401 });
  }

  const apiRes = await fetch(`${API_URL}/participations/${id}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  });
  if (apiRes.status === 204) {
    return new NextResponse(null, { status: 204 });
  }
  const resBody = await apiRes.text();
  return new NextResponse(resBody, {
    status: apiRes.status,
    headers: {
      'Content-Type':
        apiRes.headers.get('content-type') ?? 'application/json',
    },
  });
}
