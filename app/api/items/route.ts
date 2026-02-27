import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
    try {
        const session = await getSession();
        if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const { searchParams } = new URL(request.url);
        const filter = searchParams.get('filter') || 'global'; // 'global', 'personal', 'admin'
        const tag = searchParams.get('tag');

        let whereClause: any = {};

        if (filter === 'personal') {
            whereClause.ownerId = session.userId;
        } else if (filter === 'global') {
            whereClause.isPublic = true;
            if (session.role !== 'ADMIN') {
                // Exclude own items from global list if they want to rent from others?
                // Actually, just show all public items.
            }
        } else if (filter === 'admin' && session.role === 'ADMIN') {
            // No filter, show all
        } else if (filter === 'admin') {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        const items = await prisma.item.findMany({
            where: whereClause,
            include: {
                owner: { select: { username: true } },
            },
            orderBy: { createdAt: 'desc' },
        });

        // Simple tag filtering (since tags is a JSON string)
        let filteredItems = items;
        if (tag) {
            filteredItems = items.filter((item: any) => {
                try {
                    const tags = JSON.parse(item.tags);
                    return tags.includes(tag);
                } catch {
                    return false;
                }
            });
        }

        return NextResponse.json(filteredItems);
    } catch (error) {
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const session = await getSession();
        if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const data = await request.json();
        const { name, description, initialCondition, images, isPublic, personalNotes, tags } = data;

        if (!name || !description || !initialCondition) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const newItem = await prisma.item.create({
            data: {
                name,
                description,
                initialCondition,
                images: JSON.stringify(images || []),
                isPublic: isPublic !== undefined ? isPublic : true,
                personalNotes: personalNotes || '',
                tags: JSON.stringify(tags || []),
                ownerId: session.userId,
            },
        });

        return NextResponse.json(newItem);
    } catch (error) {
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
