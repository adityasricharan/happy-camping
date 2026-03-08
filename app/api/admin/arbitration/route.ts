import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
    try {
        const session = await getSession();
        if (!session || (session.role !== 'ADMIN' && session.role !== 'SUPERADMIN')) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const disputes = await prisma.loanRequest.findMany({
            where: { arbitrationRequested: true },
            include: {
                item: { include: { owner: { select: { username: true } } } },
                loanee: { select: { username: true } },
            },
            orderBy: { updatedAt: 'desc' }
        });

        return NextResponse.json(disputes);
    } catch (error) {
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
