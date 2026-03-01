import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
    const args = process.argv.slice(2);

    if (args.length !== 2) {
        console.error('Usage: npx tsx scripts/reset-password.ts <username> <new_password>');
        process.exit(1);
    }

    const [username, newPassword] = args;

    if (newPassword.length < 6) {
        console.error('Error: New password must be at least 6 characters.');
        process.exit(1);
    }

    try {
        const targetUser = await prisma.user.findUnique({ where: { username } });

        if (!targetUser) {
            console.error(`Error: User '${username}' not found in the database.`);
            process.exit(1);
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);

        const updatedUser = await prisma.user.update({
            where: { username },
            data: { password: hashedPassword }
        });

        console.log(`\n✅ Successfully forced password reset for user: ${updatedUser.username}`);
        console.log(`They can now log in using the new password.`);

    } catch (error) {
        console.error('Failed to reset user password:', error);
    } finally {
        await prisma.$disconnect();
    }
}

main();
