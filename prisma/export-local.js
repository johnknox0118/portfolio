const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

async function main() {
  console.log("Starting data dump from local SQLite...");
  const data = {
    profile: await prisma.profile.findMany(),
    education: await prisma.education.findMany(),
    timelineEvent: await prisma.timelineEvent.findMany(),
    skill: await prisma.skill.findMany(),
    project: await prisma.project.findMany(),
    certification: await prisma.certification.findMany(),
    internship: await prisma.internship.findMany(),
    achievement: await prisma.achievement.findMany(),
    galleryItem: await prisma.galleryItem.findMany(),
    setting: await prisma.setting.findMany(),
    admin: await prisma.admin.findMany()
  };

  fs.writeFileSync(
    path.join(__dirname, 'local-data-dump.json'),
    JSON.stringify(data, null, 2)
  );
  console.log("Local database successfully dumped to prisma/local-data-dump.json");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
