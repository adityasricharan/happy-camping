import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const args = process.argv.slice(2);

    if (args.length !== 1) {
        console.error('Usage: npx tsx scripts/delete-user.ts <username>');
        process.exit(1);
    }

    const [username] = args;

    try {
        const user = await prisma.user.findUnique({ where: { username } });

        if (!user) {
            console.error(`Error: User '${username}' not found.`);
            process.exit(1);
        }

        const deletedUser = await prisma.user.delete({
            where: { username }
        });

        console.log(`\n🗑️ Successfully DELETED user: ${deletedUser.username}`);

    } catch (error) {
        console.error('Failed to delete user:', error);
    } finally {
        await prisma.$disconnect();
    }
}

main();
