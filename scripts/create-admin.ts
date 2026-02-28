import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
    const args = process.argv.slice(2);

    if (args.length !== 2) {
        console.error('Usage: npx tsx scripts/create-admin.ts <username> <password>');
        process.exit(1);
    }

    const [username, password] = args;

    try {
        const existingAdmin = await prisma.user.findUnique({ where: { username } });

        if (existingAdmin) {
            console.error(`Error: User with username '${username}' already exists.`);
            process.exit(1);
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newAdmin = await prisma.user.create({
            data: {
                username,
                password: hashedPassword,
                role: 'ADMIN',
            }
        });

        console.log(`Successfully created ADMIN user: ${newAdmin.username} (ID: ${newAdmin.id})`);
    } catch (error) {
        console.error('Failed to create admin instance:', error);
    } finally {
        await prisma.$disconnect();
    }
}

main();
