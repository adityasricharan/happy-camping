import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
    const args = process.argv.slice(2);

    if (args.length !== 2) {
        console.error('Usage: npx tsx scripts/create-superadmin.ts <username> <password>');
        process.exit(1);
    }

    const [username, password] = args;

    try {
        const existingUser = await prisma.user.findUnique({ where: { username } });

        if (existingUser) {
            console.error(`Error: User with username '${username}' already exists.`);
            process.exit(1);
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newSuperadmin = await prisma.user.create({
            data: {
                username,
                password: hashedPassword,
                role: 'SUPERADMIN',
            }
        });

        console.log(`\n👑 Successfully created ROOT SUPERADMIN user: ${newSuperadmin.username} (ID: ${newSuperadmin.id})`);
        console.log(`Keep these credentials safe. This account has absolute control over the platform.`);
    } catch (error) {
        console.error('Failed to create superadmin instance:', error);
    } finally {
        await prisma.$disconnect();
    }
}

main();
