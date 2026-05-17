import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

const API_URL = process.env.API_URL ?? 'http://localhost:8000';

export async function POST(request: Request) {
  const token = (await cookies()).get('auth_token')?.value;
  if (!token) {
    return NextResponse.json({ message: 'Non authentifié' }, { status: 401 });
  }

  const incoming = await request.formData();
  const forwarded = new FormData();
  for (const [name, value] of incoming.entries()) {
    forwarded.append(name, value);
  }

  const apiRes = await fetch(`${API_URL}/files`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: forwarded,
  });

  const body = await apiRes.text();
  return new NextResponse(body, {
    status: apiRes.status,
    headers: {
      'Content-Type': apiRes.headers.get('content-type') ?? 'application/json',
    },
  });
}
