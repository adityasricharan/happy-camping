import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seedLoan() {
    try {
        console.log("Locating camper_one, camper_two, and the tent...");
        const camperOne = await prisma.user.findUnique({ where: { username: 'camper_one' } });
        const camperTwo = await prisma.user.findUnique({ where: { username: 'camper_two' } });

        if (!camperOne || !camperTwo) throw new Error("Seed users not found");

        const items = await prisma.item.findMany({ where: { ownerId: camperOne.id } });
        const tent = items.find(i => i.name.includes("Tent") || i.name.includes("backpack"));
        if (!tent) throw new Error("Target item not found");

        console.log(`Using Item: ${tent.name}`);

        console.log("Clearing any existing loans for this item...");
        await prisma.loanRequest.deleteMany({ where: { itemId: tent.id } });

        console.log("Forging a RETURN_PENDING loan state...");
        await prisma.item.update({ where: { id: tent.id }, data: { status: 'LOANED' } });

        await prisma.loanRequest.create({
            data: {
                itemId: tent.id,
                loaneeId: camperTwo.id,
                loaneeObservation: "Looks good at pickup",
                receivedCondition: "Perfect",
                receivedConditionStatus: "ACCEPTED",
                status: 'RETURN_PENDING'
            }
        });

        console.log("Loan successfully seeded! Ready for Admin Arbitration test.");
    } catch (error) {
        console.error("Error seeding loan:", error);
    } finally {
        await prisma.$disconnect();
    }
}

seedLoan();
