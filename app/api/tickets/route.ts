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

        const { searchParams } = new URL(request.url);
        const tag = searchParams.get('tag');
        const status = searchParams.get('status');

        const where: any = {};
        if (tag) where.tag = tag;
        if (status) where.status = status;

        const tickets = await prisma.ticket.findMany({
            where,
            include: {
                requester: { select: { username: true } },
                assignedTo: { select: { username: true } },
            },
            orderBy: { createdAt: 'desc' }
        });

        return NextResponse.json(tickets);
    } catch (error) {
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const session = await getSession();
        // Allow unauthenticated users to create tickets? No, the plan says "allow authenticated users to submit"
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized. Please log in to submit a ticket.' }, { status: 401 });
        }

        const data = await request.json();
        const { title, description, tag } = data;

        if (!title || !description || !tag) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const validTags = ['GEAR_DISPUTE', 'PASSWORD_RESET', 'HELP_REQUEST', 'OTHER'];
        if (!validTags.includes(tag)) {
            return NextResponse.json({ error: 'Invalid tag' }, { status: 400 });
        }

        const ticket = await prisma.ticket.create({
            data: {
                title,
                description,
                tag,
                status: 'OPEN',
                priority: tag === 'GEAR_DISPUTE' || tag === 'PASSWORD_RESET' ? 'HIGH' : 'MEDIUM',
                requesterId: session.userId,
            }
        });

        return NextResponse.json(ticket, { status: 201 });
    } catch (error) {
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
