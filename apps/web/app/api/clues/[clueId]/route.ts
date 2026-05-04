import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

const API_URL = process.env.API_URL ?? 'http://localhost:8000';

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ clueId: string }> },
) {
  const { clueId } = await params;
  const token = (await cookies()).get('auth_token')?.value;
  if (!token) {
    return NextResponse.json({ message: 'Non authentifié' }, { status: 401 });
  }

  const body = await request.json();
  const apiRes = await fetch(`${API_URL}/clues/${clueId}`, {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });
  const resBody = await apiRes.text();
  return new NextResponse(resBody, {
    status: apiRes.status,
    headers: {
      'Content-Type': apiRes.headers.get('content-type') ?? 'application/json',
    },
  });
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ clueId: string }> },
) {
  const { clueId } = await params;
  const token = (await cookies()).get('auth_token')?.value;
  if (!token) {
    return NextResponse.json({ message: 'Non authentifié' }, { status: 401 });
  }

  const apiRes = await fetch(`${API_URL}/clues/${clueId}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  });
  return new NextResponse(null, { status: apiRes.status });
}