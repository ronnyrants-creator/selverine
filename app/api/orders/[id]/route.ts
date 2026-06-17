import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

const VALID_STATUSES = ['new', 'confirmed', 'delivered', 'cancelled'];

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { status } = await req.json();

    if (!VALID_STATUSES.includes(status)) {
      return NextResponse.json({ error: 'Statut invalide' }, { status: 400 });
    }

    const updated = await prisma.order.update({
      where: { id: Number(id) },
      data: { status },
    });

    return NextResponse.json(updated);
  } catch (err) {
    console.error('[PATCH /api/orders/[id]]', err);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
