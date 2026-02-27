import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { createSession } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
    try {
        const { username, password, type } = await request.json();

        if (!username || !password) {
            return NextResponse.json({ error: 'Missing username or password' }, { status: 400 });
        }

        const existingUser = await prisma.user.findUnique({ where: { username } });
        if (existingUser) {
            return NextResponse.json({ error: 'Username already exists' }, { status: 400 });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const role = type === 'admin' ? 'ADMIN' : 'USER'; // Only for demonstration; naturally you might restrict admin creation

        const user = await prisma.user.create({
            data: {
                username,
                password: hashedPassword,
                role,
            },
        });

        await createSession(user.id, user.username, user.role);

        return NextResponse.json({ success: true, userId: user.id, role: user.role });
    } catch (error) {
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
