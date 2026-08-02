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
      articles,
    ] = await Promise.all([
      prisma.profile.findFirst().catch(() => null),
      prisma.setting.findFirst().catch(() => null),
      prisma.education.findMany({ orderBy: { id: 'asc' } }).catch(() => []),
      prisma.timelineEvent.findMany({ orderBy: { displayOrder: 'asc' } }).catch(() => []),
      prisma.skill.findMany({ orderBy: { displayOrder: 'asc' } }).catch(() => []),
      prisma.project.findMany({ orderBy: { id: 'asc' } }).catch(() => []),
      prisma.certification.findMany({ orderBy: { id: 'asc' } }).catch(() => []),
      prisma.internship.findMany({ orderBy: { id: 'asc' } }).catch(() => []),
      prisma.achievement.findMany({ orderBy: { id: 'asc' } }).catch(() => []),
      prisma.galleryItem.findMany({ orderBy: { id: 'asc' } }).catch(() => []),
      prisma.article.findMany({ orderBy: { id: 'asc' } }).catch(() => []),
    ]);

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

    const parsedProjects = parseJsonFields(projects, ['tags', 'logs', 'challenges', 'solutions', 'screenshots']);
    const parsedCertifications = parseJsonFields(certifications, ['skills']);
    const parsedInternships = parseJsonFields(internships, ['skills']);
    const parsedArticles = parseJsonFields(articles, ['tags']);

    return NextResponse.json({
      profile: profile || {
        name: "Johnknox Kalle",
        title: "Cybersecurity Engineer & Full Stack Architect",
        tagline: "Securing Systems & Building Resilient Infrastructure",
        bio: "Specializing in threat response, secure system architectures, Python development, and full-stack cloud applications.",
        location: "Prathyusha Engineering College, Thiruvallur, Tamilnadu",
        phone: "+91 9182597274",
        email: "johnknox.kalle@gmail.com",
        linkedin: "https://www.linkedin.com/in/john-knox-kalle-309b15301/",
        github: "https://github.com/johnknox0118",
      },
      settings: settings || {},
      education: education || [],
      timeline: timeline || [],
      skills: skills || [],
      projects: parsedProjects || [],
      certifications: parsedCertifications || [],
      internships: parsedInternships || [],
      achievements: achievements || [],
      gallery: gallery || [],
      articles: parsedArticles || [],
    });
  } catch (error: any) {
    console.error('Public data API error:', error);
    return NextResponse.json({
      profile: {
        name: "Johnknox Kalle",
        title: "Cybersecurity Engineer & Full Stack Architect",
        tagline: "Securing Systems & Building Resilient Infrastructure",
        bio: "Specializing in threat response, secure system architectures, Python development, and full-stack cloud applications.",
        location: "Prathyusha Engineering College, Thiruvallur, Tamilnadu",
        phone: "+91 9182597274",
        email: "johnknox.kalle@gmail.com",
        linkedin: "https://www.linkedin.com/in/john-knox-kalle-309b15301/",
        github: "https://github.com/johnknox0118",
      },
      settings: {},
      education: [],
      timeline: [],
      skills: [],
      projects: [],
      certifications: [],
      internships: [],
      achievements: [],
      gallery: [],
      articles: [],
    });
  }
}
