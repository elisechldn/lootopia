import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { API_URL } from '@/lib/api';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ stepId: string }> },
) {
  const { stepId } = await params;
  const token = (await cookies()).get('auth_token')?.value;
  if (!token) {
    return NextResponse.json({ message: 'Non authentifié' }, { status: 401 });
  }

  const apiRes = await fetch(`${API_URL}/steps/${stepId}/clues`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const body = await apiRes.text();
  return new NextResponse(body, {
    status: apiRes.status,
    headers: {
      'Content-Type': apiRes.headers.get('content-type') ?? 'application/json',
    },
  });
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ stepId: string }> },
) {
  const { stepId } = await params;
  const token = (await cookies()).get('auth_token')?.value;
  if (!token) {
    return NextResponse.json({ message: 'Non authentifié' }, { status: 401 });
  }

  const body = await request.json();
  const apiRes = await fetch(`${API_URL}/steps/${stepId}/clues`, {
    method: 'POST',
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
