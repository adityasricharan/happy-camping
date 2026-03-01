import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import bcrypt from 'bcryptjs';

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const body = await request.json();
        const { newPassword } = body;

        if (!newPassword || newPassword.length < 6) {
            return NextResponse.json({ error: 'New password must be at least 6 characters long.' }, { status: 400 });
        }

        const session = await getSession();
        if (!session || (session.role !== 'ADMIN' && session.role !== 'SUPERADMIN')) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Fetch the executor to check their exact privileges
        const executor = await prisma.user.findUnique({ where: { id: session.userId as string } });
        if (!executor) return NextResponse.json({ error: 'Session invalid' }, { status: 401 });

        const targetUser = await prisma.user.findUnique({ where: { id } });
        if (!targetUser) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        // You cannot reset yourself using this endpoint
        if (session.userId === id) {
            return NextResponse.json({ error: 'Please use your personal Settings page to reset your own password.' }, { status: 400 });
        }

        // RBAC Enforcement Rules
        // 1. Superadmins can reset anyone except themselves (handled above).
        // 2. Standard Admins can ONLY reset standard Users, AND only if they have the specific canResetPasswords flag enabled.
        if (session.role === 'ADMIN') {
            if (!executor.canResetPasswords) {
                return NextResponse.json({ error: 'You have not been granted password-master privileges by a Superadmin.' }, { status: 403 });
            }
            if (targetUser.role === 'ADMIN' || targetUser.role === 'SUPERADMIN') {
                return NextResponse.json({ error: 'Standard Administrators cannot reset the passwords of other Administrators.' }, { status: 403 });
            }
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);

        await prisma.user.update({
            where: { id },
            data: { password: hashedPassword }
        });

        return NextResponse.json({ success: true, message: `Successfully forced password reset for ${targetUser.username}` });
    } catch (error) {
        console.error("Error forcing password reset:", error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
