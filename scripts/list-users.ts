import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    try {
        console.log("Fetching users...\n");
        const users = await prisma.user.findMany({
            select: {
                id: true,
                username: true,
                role: true,
                isActive: true,
                karmaPoints: true,
                createdAt: true
            },
            orderBy: {
                createdAt: 'asc'
            }
        });

        if (users.length === 0) {
            console.log("No users found in the database.");
            return;
        }

        console.table(users);
        console.log(`\nTotal Users: ${users.length}`);

    } catch (error) {
        console.error('Failed to query users:', error);
    } finally {
        await prisma.$disconnect();
    }
}

main();
