const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function reset() {
  const passwordHash = await bcrypt.hash('cybersecurity2026', 10);
  
  await prisma.admin.updateMany({
    data: {
      username: 'admin',
      password: passwordHash,
    },
  });
  
  console.log('Successfully reset admin user credentials:');
  console.log('Username: admin');
  console.log('Password: cybersecurity2026');
}

reset().finally(() => prisma.$disconnect());
