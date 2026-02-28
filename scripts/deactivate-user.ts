import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const args = process.argv.slice(2);

    if (args.length !== 1) {
        console.error('Usage: npx tsx scripts/deactivate-user.ts <username>');
        process.exit(1);
    }

    const [username] = args;

    try {
        const user = await prisma.user.findUnique({ where: { username } });

        if (!user) {
            console.error(`Error: User '${username}' not found.`);
            process.exit(1);
        }

        if (user.role === 'ADMIN') {
            console.warn(`WARNING: You are deactivating an ADMINISTRATOR account (${username}).`);
        }

        const updatedUser = await prisma.user.update({
            where: { username },
            data: { isActive: false }
        });

        console.log(`\n✅ Successfully deactivated user: ${updatedUser.username}`);
        console.log(`They will no longer be able to log into the application.`);

        // Note: For a production app you might also want to scrub their active JWT sessions from a session table
        // But since we use stateless JWTs in cookies, their cookie will remain valid until it expires natively (1 week).

    } catch (error) {
        console.error('Failed to deactivate user:', error);
    } finally {
        await prisma.$disconnect();
    }
}

main();
