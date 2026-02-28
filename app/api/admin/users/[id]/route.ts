import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const body = await request.json();
        const { isActive } = body;

        const session = await getSession();
        if (!session || (session.role !== 'ADMIN' && session.role !== 'SUPERADMIN')) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Prevent modifying yourself
        if (session.userId === id) {
            return NextResponse.json({ error: 'You cannot modify your own account status.' }, { status: 400 });
        }

        const targetUser = await prisma.user.findUnique({ where: { id } });
        if (!targetUser) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        // RBAC Enforcement Rules
        // 1. Nobody can touch a SUPERADMIN (except maybe another SUPERADMIN depending on policy, but here we strictly protect them)
        if (targetUser.role === 'SUPERADMIN') {
            return NextResponse.json({ error: 'SUPERADMIN accounts cannot be modified via the web interface.' }, { status: 403 });
        }

        // 2. Standard ADMINs cannot touch other ADMINs
        if (session.role === 'ADMIN' && targetUser.role === 'ADMIN') {
            return NextResponse.json({ error: 'You do not have clearance to modify another Administrator.' }, { status: 403 });
        }

        const updatedUser = await prisma.user.update({
            where: { id },
            data: { isActive }
        });

        return NextResponse.json(updatedUser);
    } catch (error) {
        console.error("Error updating user:", error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
