import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function PUT(request: Request, props: { params: Promise<{ id: string }> }) {
    try {
        const session = await getSession();
        if (!session || (session.role !== 'ADMIN' && session.role !== 'SUPERADMIN')) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const params = await props.params;
        const { id } = params;

        const data = await request.json();
        const { resolutionNotes } = data;

        const loan = await prisma.loanRequest.findUnique({
            where: { id },
            include: { item: true }
        });

        if (!loan) return NextResponse.json({ error: 'Loan not found' }, { status: 404 });
        if (!loan.arbitrationRequested) return NextResponse.json({ error: 'Loan is not in arbitration' }, { status: 400 });

        // Resolve Arbitration: Set flag to false. 
        // We forcibly complete the loan cycle and explicitly unlock the physical item back to circulation.

        await prisma.loanRequest.update({
            where: { id },
            data: {
                arbitrationRequested: false,
                status: 'COMPLETED',
                // Keep record of resolution by an admin
                ownerStatusUpdate: resolutionNotes ? `[ADMIN RESOLVED]: ${resolutionNotes}` : loan.ownerStatusUpdate
            }
        });

        // Set the disputed item back to AVAILABLE!
        await prisma.item.update({
            where: { id: loan.itemId },
            data: { status: 'AVAILABLE' }
        });

        return NextResponse.json({ message: 'Arbitration resolved' });
    } catch (error) {
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
