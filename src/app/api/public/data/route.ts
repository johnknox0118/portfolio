import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const [
      profile,
      settings,
      education,
      timeline,
      skills,
      projects,
      certifications,
      internships,
      achievements,
      gallery,
    ] = await Promise.all([
      prisma.profile.findFirst(),
      prisma.setting.findFirst(),
      prisma.education.findMany({ orderBy: { id: 'asc' } }),
      prisma.timelineEvent.findMany({ orderBy: { displayOrder: 'asc' } }),
      prisma.skill.findMany({ orderBy: { displayOrder: 'asc' } }),
      prisma.project.findMany({ orderBy: { id: 'asc' } }),
      prisma.certification.findMany({ orderBy: { id: 'asc' } }),
      prisma.internship.findMany({ orderBy: { id: 'asc' } }),
      prisma.achievement.findMany({ orderBy: { id: 'asc' } }),
      prisma.galleryItem.findMany({ orderBy: { id: 'asc' } }),
    ]);

    // Helper to safely parse JSON arrays in records
    const parseJsonFields = (records: any[], fields: string[]) => {
      return records.map((record) => {
        const copy = { ...record };
        for (const key of fields) {
          if (copy[key] && typeof copy[key] === 'string') {
            try {
              copy[key] = JSON.parse(copy[key]);
            } catch (e) {
              copy[key] = [];
            }
          }
        }
        return copy;
      });
    };

    const parsedProjects = parseJsonFields(projects, ['tags', 'logs', 'challenges', 'solutions', 'screenshots']);
    const parsedCertifications = parseJsonFields(certifications, ['skills']);
    const parsedInternships = parseJsonFields(internships, ['skills']);

    return NextResponse.json({
      profile: profile || {},
      settings: settings || {},
      education,
      timeline,
      skills,
      projects: parsedProjects,
      certifications: parsedCertifications,
      internships: parsedInternships,
      achievements,
      gallery,
    });
  } catch (error: any) {
    console.error('Public data API error:', error);
    return NextResponse.json(
      { error: 'Failed to compile database logs' },
      { status: 500 }
    );
  }
}
