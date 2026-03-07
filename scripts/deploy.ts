import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import readline from 'readline';
import { execSync } from 'child_process';

const prisma = new PrismaClient();
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

const prompt = (question: string): Promise<string> => {
    return new Promise((resolve) => {
        rl.question(question, resolve);
    });
};

async function main() {
    console.log('🏕️ Welcome to the CampSync Initialization Wizard!');
    console.log('This tool will prepare your database and create your root administrator account.\n');

    try {
        // 1. Initialize DB structure
        console.log('📦 Initializing Database Schema...');
        try {
            execSync('npx prisma db push', { stdio: 'inherit' });
            console.log('✅ Database schema pushed successfully.\n');
        } catch (execError) {
            console.error('\n❌ Failed to push Prisma schema. Ensure SQLite is writable and the schema is valid.');
            process.exit(1);
        }

        // 2. Prompt for Superadmin Credentials
        console.log('🔐 Create Superadmin Account');
        console.log('This account will have absolute control over the platform.\n');

        let username = await prompt('Enter desired Superadmin Username: ');
        username = username.trim();

        if (!username) {
            console.error('❌ Username cannot be empty.');
            process.exit(1);
        }

        // Optional: In a real production script, you'd want to mask password input.
        // For local Next.js development, basic readline is acceptable.
        let password = await prompt('Enter desired Superadmin Password: ');
        password = password.trim();

        if (password.length < 6) {
            console.error('❌ Password must be at least 6 characters long.');
            process.exit(1);
        }

        console.log('\n⚙️ Provisioning account...');

        // 3. Check for existing superadmin
        const existingUser = await prisma.user.findUnique({ where: { username } });
        if (existingUser) {
            console.log(`⚠️ User '${username}' already exists.`);
            if (existingUser.role !== 'SUPERADMIN') {
                console.log(`⚠️ Note: '${username}' exists but is NOT a superadmin.`);
            } else {
                console.log(`✅ '${username}' is already a superadmin. Your instance is ready.`);
            }
        } else {
            // 4. Create the superadmin
            const hashedPassword = await bcrypt.hash(password, 10);
            const newSuperadmin = await prisma.user.create({
                data: {
                    username,
                    password: hashedPassword,
                    role: 'SUPERADMIN',
                }
            });

            console.log(`\n👑 Successfully created ROOT SUPERADMIN user: ${newSuperadmin.username}`);
            console.log(`Keep these credentials safe!`);
        }

        console.log('\n🚀 CampSync is initialized and ready to launch!');
        console.log('Run `npm run dev` to start the local server.\n');

    } catch (error) {
        console.error('\n❌ Initialization failed:', error);
    } finally {
        rl.close();
        await prisma.$disconnect();
    }
}

main();
