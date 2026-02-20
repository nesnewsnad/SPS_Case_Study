import { NextResponse } from 'next/server';
import { db } from '@/db';
import { entities } from '@/db/schema';
import type { EntitiesResponse } from '@/lib/api-types';

export async function GET() {
  try {
    const rows = await db.select().from(entities);
    const response: EntitiesResponse = {
      entities: rows.map((r) => ({
        id: r.id,
        name: r.name,
        description: r.description,
      })),
    };
    return NextResponse.json(response);
  } catch (err) {
    console.error('GET /api/entities error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
