import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export const dynamic = 'force-dynamic';

function calculateKarma(tagsJson: string): number {
    try {
        const tags = JSON.parse(tagsJson) as string[];
        const lowerTags = tags.map(t => t.toLowerCase());
        if (lowerTags.includes('tent')) return 50;
        if (lowerTags.includes('sleeping bag')) return 30;
        if (lowerTags.includes('stove')) return 20;
        return 10;
    } catch {
        return 10;
    }
}

export async function PUT(request: Request, props: { params: Promise<{ id: string }> }) {
    try {
        const session = await getSession();
        if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const params = await props.params;
        const { id } = params;

        const loan = await prisma.loanRequest.findUnique({
            where: { id },
            include: { item: true }
        });

        if (!loan) return NextResponse.json({ error: 'Loan not found' }, { status: 404 });

        const data = await request.json();
        const { loaneeObservation, ownerStatusUpdate, arbitrationRequested, status } = data;

        const isOwner = loan.item.ownerId === session.userId;
        const isLoanee = loan.loaneeId === session.userId;
        const isAdmin = session.role === 'ADMIN';

        if (!isOwner && !isLoanee && !isAdmin) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        const updateData: any = {};
        if (loaneeObservation !== undefined && (isLoanee || isAdmin)) {
            updateData.loaneeObservation = loaneeObservation;
        }
        if (ownerStatusUpdate !== undefined && (isOwner || isAdmin)) {
            updateData.ownerStatusUpdate = ownerStatusUpdate;
        }
        if (arbitrationRequested !== undefined && (isOwner || isLoanee || isAdmin)) {
            updateData.arbitrationRequested = arbitrationRequested;
        }

        if (status === 'RETURNED' && loan.status !== 'RETURNED' && (isOwner || isAdmin)) {
            updateData.status = 'RETURNED';

            await prisma.item.update({
                where: { id: loan.itemId },
                data: { status: 'AVAILABLE' }
            });

            if (loan.loaneeId) {
                const points = calculateKarma(loan.item.tags);
                await prisma.user.update({
                    where: { id: loan.item.ownerId },
                    data: { karmaPoints: { increment: points } }
                });
            }
        }

        const updatedLoan = await prisma.loanRequest.update({
            where: { id },
            data: updateData
        });

        return NextResponse.json(updatedLoan);
    } catch (error) {
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
