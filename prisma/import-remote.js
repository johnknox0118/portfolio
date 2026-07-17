const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

async function main() {
  console.log("Loading dump file...");
  const dataPath = path.join(__dirname, 'local-data-dump.json');
  if (!fs.existsSync(dataPath)) {
    console.error("Error: Dump file prisma/local-data-dump.json not found!");
    process.exit(1);
  }

  const dump = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
  console.log("Dump file loaded. Starting remote data migration...");

  console.log("Cleaning up target database...");
  await prisma.message.deleteMany();
  await prisma.galleryItem.deleteMany();
  await prisma.achievement.deleteMany();
  await prisma.internship.deleteMany();
  await prisma.certification.deleteMany();
  await prisma.project.deleteMany();
  await prisma.skill.deleteMany();
  await prisma.timelineEvent.deleteMany();
  await prisma.education.deleteMany();
  await prisma.profile.deleteMany();
  await prisma.setting.deleteMany();
  await prisma.admin.deleteMany();

  console.log("Migrating admin...");
  if (dump.admin.length > 0) {
    await prisma.admin.createMany({ data: dump.admin });
  }

  console.log("Migrating profile...");
  if (dump.profile.length > 0) {
    await prisma.profile.createMany({ data: dump.profile });
  }

  console.log("Migrating settings...");
  if (dump.setting.length > 0) {
    await prisma.setting.createMany({ data: dump.setting });
  }

  console.log("Migrating education...");
  if (dump.education.length > 0) {
    await prisma.education.createMany({ data: dump.education });
  }

  console.log("Migrating timeline events...");
  if (dump.timelineEvent.length > 0) {
    await prisma.timelineEvent.createMany({ data: dump.timelineEvent });
  }

  console.log("Migrating skills...");
  if (dump.skill.length > 0) {
    await prisma.skill.createMany({ data: dump.skill });
  }

  console.log("Migrating projects...");
  if (dump.project.length > 0) {
    await prisma.project.createMany({ data: dump.project });
  }

  console.log("Migrating certifications...");
  if (dump.certification.length > 0) {
    await prisma.certification.createMany({ data: dump.certification });
  }

  console.log("Migrating internships...");
  if (dump.internship.length > 0) {
    await prisma.internship.createMany({ data: dump.internship });
  }

  console.log("Migrating achievements...");
  if (dump.achievement.length > 0) {
    await prisma.achievement.createMany({ data: dump.achievement });
  }

  console.log("Migrating gallery items...");
  if (dump.galleryItem.length > 0) {
    await prisma.galleryItem.createMany({ data: dump.galleryItem });
  }

  console.log("Data migration successfully completed!");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
