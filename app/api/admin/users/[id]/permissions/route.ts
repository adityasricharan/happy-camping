import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const body = await request.json();
        const { canResetPasswords } = body;

        const session = await getSession();
        // ONLY Superadmins can delegate password-master privileges
        if (!session || session.role !== 'SUPERADMIN') {
            return NextResponse.json({ error: 'Unauthorized: Only Superadmins can delegate password reset authority.' }, { status: 403 });
        }

        const targetUser = await prisma.user.findUnique({ where: { id } });
        if (!targetUser) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        // Only Standard Admins can be granted this privilege (Users shouldn't have it, Superadmins implicitly have it)
        if (targetUser.role !== 'ADMIN') {
            return NextResponse.json({ error: 'This privilege can only be granted to standard Administrator accounts.' }, { status: 400 });
        }

        const updatedUser = await prisma.user.update({
            where: { id },
            data: { canResetPasswords }
        });

        return NextResponse.json({ success: true, user: updatedUser });
    } catch (error) {
        console.error("Error updating user permissions:", error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
