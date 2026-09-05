import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import fallbackData from '@/data/fallbackData.json';

export const dynamic = 'force-dynamic';

// Helper to safely fetch questions from Prisma or fallbackData
async function getQuestionsFromDb() {
  try {
    const questions = await prisma.ctfQuestion.findMany({
      orderBy: [{ stageNumber: 'asc' }, { displayOrder: 'asc' }],
    });
    if (questions && questions.length > 0) {
      return questions;
    }
  } catch (err) {
    console.warn('Prisma ctfQuestion fetch failed, using fallback:', err);
  }
  return (fallbackData as any).ctfQuestions || [];
}

// Helper to safely parse JSON options
function parseOptions(options: any): any[] {
  if (Array.isArray(options)) return options;
  if (typeof options === 'string') {
    try {
      const parsed = JSON.parse(options);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }
  return [];
}

// GET: Fetch questions with answers stripped out
export async function GET() {
  try {
    const questions = await getQuestionsFromDb();

    // Sanitize questions: NEVER expose the correct answer to the client!
    const sanitized = questions.map((q: any) => ({
      id: q.id,
      stageNumber: q.stageNumber,
      category: q.category || 'CHALLENGE',
      title: q.title,
      description: q.description,
      clue: q.clue || '',
      type: q.type || 'text',
      options: parseOptions(q.options),
      points: q.points || 100,
    }));

    const totalPoints = sanitized.reduce((acc: number, curr: any) => acc + (curr.points || 100), 0);

    return NextResponse.json({
      success: true,
      totalStages: sanitized.length,
      totalPoints,
      questions: sanitized,
    });
  } catch (err: any) {
    console.error('CTF GET Error:', err);
    return NextResponse.json({ error: 'Failed to retrieve CTF questions' }, { status: 500 });
  }
}

// POST: Handles start, verify, and complete actions
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action } = body;

    // 1. START: Register participant and begin session
    if (action === 'start') {
      const { userName, email, role } = body;
      if (!userName || !userName.trim()) {
        return NextResponse.json({ error: 'Participant name / callsign is required.' }, { status: 400 });
      }

      const questions = await getQuestionsFromDb();
      const totalStages = questions.length;

      let submissionId = Date.now();
      try {
        const newSubmission = await prisma.ctfSubmission.create({
          data: {
            userName: userName.trim(),
            email: (email || '').trim(),
            role: (role || 'Recruiter / Visitor').trim(),
            score: 0,
            totalStages,
            stagesCompleted: 0,
            status: 'in_progress',
            details: '[]',
            timeSpentSec: 0,
            ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || '127.0.0.1',
            userAgent: request.headers.get('user-agent') || 'Browser Client',
          },
        });
        submissionId = newSubmission.id;
      } catch (dbErr) {
        console.warn('Prisma ctfSubmission.create failed, continuing with fallback ID:', dbErr);
      }

      return NextResponse.json({
        success: true,
        submissionId,
        userName: userName.trim(),
        totalStages,
      });
    }

    // 2. VERIFY: Server-side validation of a stage answer
    if (action === 'verify') {
      const { questionId, answer, submissionId } = body;
      if (!questionId || answer === undefined) {
        return NextResponse.json({ error: 'Missing question ID or answer.' }, { status: 400 });
      }

      const questions = await getQuestionsFromDb();
      const question = questions.find((q: any) => q.id === Number(questionId));

      if (!question) {
        return NextResponse.json({ error: 'Challenge stage not found.' }, { status: 404 });
      }

      const submittedStr = String(answer).trim().toLowerCase();
      const expectedStr = String(question.answer || '').trim().toLowerCase();

      const isCorrect = submittedStr === expectedStr;

      if (!isCorrect) {
        return NextResponse.json({
          correct: false,
          hint: question.hint || 'Incorrect answer or payload mismatch. Inspect clue and try again.',
        });
      }

      // If correct, update submission record if submissionId exists
      if (submissionId) {
        try {
          const sub = await prisma.ctfSubmission.findUnique({
            where: { id: Number(submissionId) },
          });

          if (sub) {
            let detailsArr: any[] = [];
            try {
              detailsArr = JSON.parse(sub.details || '[]');
            } catch {}

            // Prevent duplicate score addition for same stage
            const alreadyPassed = detailsArr.some((d: any) => d.stageNumber === question.stageNumber);
            if (!alreadyPassed) {
              detailsArr.push({
                stageNumber: question.stageNumber,
                title: question.title,
                pointsAwarded: question.points || 100,
                passedAt: new Date().toISOString(),
              });

              await prisma.ctfSubmission.update({
                where: { id: Number(submissionId) },
                data: {
                  score: sub.score + (question.points || 100),
                  stagesCompleted: sub.stagesCompleted + 1,
                  details: JSON.stringify(detailsArr),
                },
              });
            }
          }
        } catch (dbErr) {
          console.warn('Failed to update submission progress in database:', dbErr);
        }
      }

      return NextResponse.json({
        correct: true,
        pointsAwarded: question.points || 100,
        nextStage: question.stageNumber + 1,
      });
    }

    // 3. COMPLETE: Mark challenge finished and calculate final score
    if (action === 'complete') {
      const { submissionId, timeSpentSec } = body;

      if (submissionId) {
        try {
          await prisma.ctfSubmission.update({
            where: { id: Number(submissionId) },
            data: {
              status: 'completed',
              timeSpentSec: Number(timeSpentSec) || 0,
            },
          });
        } catch (dbErr) {
          console.warn('Failed to complete submission in database:', dbErr);
        }
      }

      return NextResponse.json({
        success: true,
        message: 'Security Audit Verification successfully recorded.',
      });
    }

    return NextResponse.json({ error: 'Invalid action specified' }, { status: 400 });
  } catch (err: any) {
    console.error('CTF POST Error:', err);
    return NextResponse.json({ error: 'Failed to process CTF action' }, { status: 500 });
  }
}
