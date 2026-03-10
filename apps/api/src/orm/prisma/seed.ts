import { PrismaPg } from '@prisma/adapter-pg';
import 'dotenv/config';
import { Pool } from 'pg';
import { PrismaClient } from './generated/client';

const connectionString = `${process.env.DATABASE_URL}`;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  const user1 = await prisma.user.upsert({
    where: { email: 'jeremy.sananikone@lootopia.io' },
    update: {},
    create: {
      email: 'jeremy.sananikone@lootopia.io',
      password: '$2a$10$99WlQKWJVzFTcfVPGwa.rOicZtrwUrZNkDpVtNoyCPX8yqSrgbXQu',
      username: 'jeremy',
      firstname: 'Jérémy',
      lastname: 'Sananikone',
      profilePicture: null,
      lastConnection: new Date(),
      country: 'FR',
      roles: {
        create: {
          name: 'admin',
        },
      },
    },
  });

  console.log({ user1 });
}

main()
  .then(async () => {
    await prisma.$disconnect();
    await pool.end();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    await pool.end();
    process.exit(1);
  });
