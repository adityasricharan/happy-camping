import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function PUT(request: Request, props: { params: Promise<{ id: string }> }) {
    try {
        const session = await getSession();
        if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const params = await props.params;
        const { id } = params;

        const item = await prisma.item.findUnique({ where: { id } });
        if (!item) return NextResponse.json({ error: 'Item not found' }, { status: 404 });

        if (item.ownerId !== session.userId && session.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        const data = await request.json();

        const { name, description, initialCondition, status, images, isPublic, personalNotes, tags } = data;

        const updatedItem = await prisma.item.update({
            where: { id },
            data: {
                ...(name !== undefined && { name }),
                ...(description !== undefined && { description }),
                ...(initialCondition !== undefined && { initialCondition }),
                ...(status !== undefined && { status }),
                ...(images !== undefined && { images: JSON.stringify(images) }),
                ...(isPublic !== undefined && { isPublic }),
                ...(personalNotes !== undefined && { personalNotes }),
                ...(tags !== undefined && { tags: JSON.stringify(tags) })
            },
        });

        return NextResponse.json(updatedItem);
    } catch (error) {
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

export async function DELETE(request: Request, props: { params: Promise<{ id: string }> }) {
    try {
        const session = await getSession();
        if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const params = await props.params;
        const { id } = params;

        const item = await prisma.item.findUnique({ where: { id } });
        if (!item) return NextResponse.json({ error: 'Item not found' }, { status: 404 });

        if (item.ownerId !== session.userId && session.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        await prisma.item.delete({ where: { id } });

        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
