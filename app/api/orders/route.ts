import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, phone, city, bundle = 1, total = 0, ref } = body;

    if (!name?.trim() || !phone?.trim() || !city?.trim()) {
      return NextResponse.json({ error: 'Champs requis manquants' }, { status: 400 });
    }

    const order = await prisma.order.create({
      data: {
        ref: ref || `SLV-${Date.now().toString(36).toUpperCase()}`,
        name: name.trim(),
        phone: phone.trim(),
        city: city.trim(),
        bundle: Number(bundle),
        total: Number(total),
        status: 'new',
      },
    });

    return NextResponse.json({ success: true, id: order.id, ref: order.ref });
  } catch (err) {
    console.error('[POST /api/orders]', err);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

export async function GET() {
  try {
    const orders = await prisma.order.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(orders);
  } catch (err) {
    console.error('[GET /api/orders]', err);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
