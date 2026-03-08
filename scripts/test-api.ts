import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function testPutLogic() {
    try {
        const id = (await prisma.loanRequest.findFirst({ where: { status: 'RETURN_PENDING' } }))?.id;
        if (!id) throw new Error("No loan found");

        const loan = await prisma.loanRequest.findUnique({
            where: { id },
            include: { item: true }
        });
        if (!loan) throw new Error("Loan not found");

        const payload = { status: 'DISPUTED', returnCondition: 'Bent' };

        const updateData: any = {};
        updateData.returnCondition = payload.returnCondition;
        updateData.returnConditionStatus = payload.status;
        updateData.status = 'COMPLETED';

        console.log("Starting transaction simulations...");

        await prisma.item.update({
            where: { id: loan.itemId },
            data: { status: 'DISPUTED' } // <-- Is 'DISPUTED' valid? Yes.
        });
        console.log("Item updated to disputed");

        updateData.arbitrationRequested = true;

        const updatedLoan = await prisma.loanRequest.update({
            where: { id },
            data: updateData
        });
        console.log("Loan updated successfully!");

    } catch (error) {
        console.error("Script error:", error);
    } finally {
        await prisma.$disconnect();
    }
}
testPutLogic();
