import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import fallbackData from '@/data/fallbackData.json';

export const dynamic = 'force-dynamic';

// In-memory cache to survive momentary database pooler hiccups
let cachedData: any = null;

// Helper to safely parse JSON arrays in records
const parseJsonFields = (records: any[], fields: string[]) => {
  return (records || []).map((record) => {
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

const getFallbackResponse = () => {
  const fallback = fallbackData as any;
  const parsedProjects = parseJsonFields(fallback.projects, ['tags', 'logs', 'challenges', 'solutions', 'screenshots']);
  const parsedCertifications = parseJsonFields(fallback.certifications, ['skills']);
  const parsedInternships = parseJsonFields(fallback.internships, ['skills']);
  const parsedArticles = parseJsonFields(fallback.articles, ['tags']);

  return {
    profile: fallback.profile,
    settings: fallback.settings || {},
    education: fallback.education || [],
    timeline: fallback.timeline || [],
    skills: fallback.skills || [],
    projects: parsedProjects || [],
    certifications: parsedCertifications || [],
    internships: parsedInternships || [],
    achievements: fallback.achievements || [],
    gallery: fallback.gallery || [],
    articles: parsedArticles || [],
  };
};

export async function GET() {
  try {
    // Retry wrapper for cold-start / connection pool drops
    const runQueries = async () => {
      return Promise.all([
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
        prisma.article.findMany({ orderBy: { id: 'asc' } }),
      ]);
    };

    let results: any = null;
    try {
      results = await runQueries();
    } catch (dbErr) {
      console.warn('Prisma initial query failed, retrying in 300ms...', dbErr);
      await new Promise((resolve) => setTimeout(resolve, 300));
      try {
        results = await runQueries();
      } catch (retryErr) {
        console.error('Prisma retry also failed, falling back to cache/seed data:', retryErr);
      }
    }

    if (!results) {
      if (cachedData) {
        return NextResponse.json(cachedData);
      }
      return NextResponse.json(getFallbackResponse());
    }

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
      articles,
    ] = results;

    const parsedProjects = parseJsonFields(projects, ['tags', 'logs', 'challenges', 'solutions', 'screenshots']);
    const parsedCertifications = parseJsonFields(certifications, ['skills']);
    const parsedInternships = parseJsonFields(internships, ['skills']);
    const parsedArticles = parseJsonFields(articles, ['tags']);

    const fallback = fallbackData as any;

    // Build responsive payload ensuring all core sections have verified data
    const finalProfile = profile || fallback.profile;
    // Guarantee profile image is never blank
    if (!finalProfile.profileImageUrl) {
      finalProfile.profileImageUrl = fallback.profile.profileImageUrl;
    }

    const finalPayload = {
      profile: finalProfile,
      settings: settings || fallback.settings || {},
      education: education?.length ? education : fallback.education,
      timeline: timeline?.length ? timeline : fallback.timeline,
      skills: skills?.length ? skills : fallback.skills,
      projects: parsedProjects?.length ? parsedProjects : parseJsonFields(fallback.projects, ['tags', 'logs', 'challenges', 'solutions', 'screenshots']),
      certifications: parsedCertifications?.length ? parsedCertifications : parseJsonFields(fallback.certifications, ['skills']),
      internships: parsedInternships?.length ? parsedInternships : parseJsonFields(fallback.internships, ['skills']),
      achievements: achievements?.length ? achievements : fallback.achievements,
      gallery: gallery?.length ? gallery : fallback.gallery,
      articles: parsedArticles?.length ? parsedArticles : parseJsonFields(fallback.articles, ['tags']),
    };

    // Update in-memory cache
    cachedData = finalPayload;

    return NextResponse.json(finalPayload);
  } catch (error: any) {
    console.error('Public data API unexpected error:', error);
    if (cachedData) {
      return NextResponse.json(cachedData);
    }
    return NextResponse.json(getFallbackResponse());
  }
}
