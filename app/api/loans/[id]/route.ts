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
        const { action, payload } = data;
        // Allowed actions: 
        // 'APPROVE', 'REJECT', 'RECEIVE', 'REVIEW_RECEIVE_CONDITION', 'MARK_RETURNED', 'CONFIRM_RETURN'

        const isOwner = loan.item.ownerId === session.userId;
        const isLoanee = loan.loaneeId === session.userId;
        const isAdmin = session.role === 'ADMIN' || session.role === 'SUPERADMIN';

        if (!isOwner && !isLoanee && !isAdmin) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        const updateData: any = {};

        if (action === 'APPROVE' && (isOwner || isAdmin)) {
            if (loan.status !== 'PENDING') return NextResponse.json({ error: 'Loan is not in PENDING state' }, { status: 400 });
            if (loan.item.status !== 'AVAILABLE') return NextResponse.json({ error: 'Item is not AVAILABLE' }, { status: 400 });

            updateData.status = 'APPROVED';

            // Marks item as LOANED
            await prisma.item.update({
                where: { id: loan.itemId },
                data: { status: 'LOANED' }
            });

            // Reject all other pending loans for this item
            await prisma.loanRequest.updateMany({
                where: { itemId: loan.itemId, id: { not: id }, status: 'PENDING' },
                data: { status: 'REJECTED' }
            });

        } else if (action === 'REJECT' && (isOwner || isAdmin)) {
            if (loan.status !== 'PENDING') return NextResponse.json({ error: 'Loan is not in PENDING state' }, { status: 400 });
            updateData.status = 'REJECTED';

        } else if (action === 'RECEIVE' && (isLoanee || isAdmin)) {
            if (loan.status !== 'APPROVED') return NextResponse.json({ error: 'Loan must be APPROVED before receiving' }, { status: 400 });
            if (!payload?.receivedCondition) return NextResponse.json({ error: 'receivedCondition is required' }, { status: 400 });

            updateData.status = 'ACTIVE';
            updateData.receivedCondition = payload.receivedCondition;
            updateData.receivedConditionStatus = 'PENDING_OWNER_REVIEW';

        } else if (action === 'REVIEW_RECEIVE_CONDITION' && (isOwner || isAdmin)) {
            if (loan.status !== 'ACTIVE') return NextResponse.json({ error: 'Loan must be ACTIVE' }, { status: 400 });
            if (!payload?.status || !['ACCEPTED', 'DISPUTED'].includes(payload.status)) {
                return NextResponse.json({ error: 'Valid status is required' }, { status: 400 });
            }
            updateData.receivedConditionStatus = payload.status;
            if (payload.status === 'DISPUTED') {
                // Even if disputed at receive, they still have the item. We just flag it.
                // We could choose to escalate to Admin arbitration early here if desired.
                updateData.arbitrationRequested = true;
                await prisma.ticket.create({
                    data: {
                        title: `Gear Dispute (Receipt): ${loan.item.name}`,
                        description: `Owner disputed the condition acceptance of the gear. Item: ${loan.item.name}.`,
                        tag: 'GEAR_DISPUTE',
                        status: 'OPEN',
                        priority: 'HIGH',
                        requesterId: session.userId,
                        relatedEntityId: loan.id
                    }
                });
            }

        } else if (action === 'MARK_RETURNED' && (isLoanee || isOwner || isAdmin)) {
            // Can return from ACTIVE or if it was APPROVED but skipped RECEIVE for some reason
            if (!['ACTIVE', 'APPROVED'].includes(loan.status)) return NextResponse.json({ error: 'Invalid state to mark returned' }, { status: 400 });
            updateData.status = 'RETURN_PENDING';

        } else if (action === 'CONFIRM_RETURN' && (isOwner || isAdmin)) {
            if (loan.status !== 'RETURN_PENDING') return NextResponse.json({ error: 'Loan must be RETURN_PENDING' }, { status: 400 });
            if (!payload?.returnCondition) return NextResponse.json({ error: 'returnCondition is required' }, { status: 400 });
            if (!payload?.status || !['ACCEPTED', 'DISPUTED'].includes(payload.status)) {
                return NextResponse.json({ error: 'Valid status is required' }, { status: 400 });
            }

            updateData.returnCondition = payload.returnCondition;
            updateData.returnConditionStatus = payload.status;
            updateData.status = 'COMPLETED';

            if (payload.status === 'ACCEPTED') {
                // Return item to circulation
                await prisma.item.update({
                    where: { id: loan.itemId },
                    data: { status: 'AVAILABLE' }
                });

                // Award Karma
                if (loan.loaneeId) {
                    const points = calculateKarma(loan.item.tags);
                    await prisma.user.update({
                        where: { id: loan.item.ownerId },
                        data: { karmaPoints: { increment: points } }
                    });
                }
            } else if (payload.status === 'DISPUTED') {
                updateData.arbitrationRequested = true;

                // Item is locked until admin resolves
                await prisma.item.update({
                    where: { id: loan.itemId },
                    data: { status: 'DISPUTED' }
                });

                await prisma.ticket.create({
                    data: {
                        title: `Gear Dispute (Return): ${loan.item.name}`,
                        description: `Owner disputed the condition of the returned gear. Item: ${loan.item.name}.`,
                        tag: 'GEAR_DISPUTE',
                        status: 'OPEN',
                        priority: 'HIGH',
                        requesterId: session.userId,
                        relatedEntityId: loan.id
                    }
                });
            }
        } else {
            // Fallback for generic updates like loaneeObservation that don't transition states
            const { loaneeObservation, ownerStatusUpdate } = data;
            if (loaneeObservation !== undefined && (isLoanee || isAdmin)) updateData.loaneeObservation = loaneeObservation;
            if (ownerStatusUpdate !== undefined && (isOwner || isAdmin)) updateData.ownerStatusUpdate = ownerStatusUpdate;

            if (Object.keys(updateData).length === 0) {
                return NextResponse.json({ error: 'Invalid action or missing payload' }, { status: 400 });
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
