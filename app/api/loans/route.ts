import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
    try {
        const session = await getSession();
        if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const loans = await prisma.loanRequest.findMany({
            where: {
                OR: [
                    { loaneeId: session.userId },
                    { item: { ownerId: session.userId } },
                ]
            },
            include: {
                item: true,
                loanee: { select: { username: true } },
            },
            orderBy: { createdAt: 'desc' }
        });

        return NextResponse.json(loans);
    } catch (error) {
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const session = await getSession();
        if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const data = await request.json();
        const { itemId, loaneeId, externalLoaneeName, loaneeObservation } = data;

        if (!itemId) {
            return NextResponse.json({ error: 'Item ID is required' }, { status: 400 });
        }

        const item = await prisma.item.findUnique({ where: { id: itemId } });
        if (!item || item.status !== 'AVAILABLE') {
            return NextResponse.json({ error: 'Item not available' }, { status: 400 });
        }

        const loan = await prisma.loanRequest.create({
            data: {
                itemId,
                loaneeId: loaneeId || null,
                externalLoaneeName: externalLoaneeName || null,
                loaneeObservation: loaneeObservation || '',
                status: 'ACTIVE'
            }
        });

        await prisma.item.update({
            where: { id: itemId },
            data: { status: 'LOANED' }
        });

        return NextResponse.json(loan);
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
