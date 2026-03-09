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
        const { status, assignedToId, resolutionNotes } = data;

        const ticket = await prisma.ticket.findUnique({ where: { id } });
        if (!ticket) {
            return NextResponse.json({ error: 'Ticket not found' }, { status: 404 });
        }

        const updateData: any = {};
        if (status) updateData.status = status;
        if (assignedToId !== undefined) updateData.assignedToId = assignedToId;
        if (resolutionNotes !== undefined) updateData.resolutionNotes = resolutionNotes;

        const updatedTicket = await prisma.ticket.update({
            where: { id },
            data: updateData
        });

        return NextResponse.json(updatedTicket);
    } catch (error) {
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
