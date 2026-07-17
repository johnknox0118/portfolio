const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log("Resetting PostgreSQL primary key sequences on Supabase...");
  const tables = [
    'Admin',
    'Profile',
    'Education',
    'TimelineEvent',
    'Skill',
    'Project',
    'Certification',
    'Internship',
    'Achievement',
    'GalleryItem',
    'Message',
    'Setting'
  ];

  for (const table of tables) {
    try {
      // Find max ID in table
      const rawResult = await prisma.$queryRawUnsafe(`SELECT MAX(id) as max_id FROM "${table}"`);
      const maxId = rawResult[0]?.max_id;
      const nextId = maxId ? Number(maxId) + 1 : 1;
      
      // Reset sequence to next ID
      await prisma.$executeRawUnsafe(`ALTER SEQUENCE "${table}_id_seq" RESTART WITH ${nextId}`);
      console.log(`Successfully reset sequence for table ${table} to restart with ID ${nextId}`);
    } catch (err) {
      console.error(`Failed to reset sequence for table ${table}:`, err.message);
    }
  }
  console.log("All database sequences successfully synchronized!");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
