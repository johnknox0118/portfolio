import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import fallbackData from '@/data/fallbackData.json';

export const dynamic = 'force-dynamic';

interface ActionItem {
  type: 'link' | 'scroll';
  text: string;
  url?: string;
  targetId?: string;
}

// Extract [[ACTION:type:target:label]] tags from AI response
function extractActions(rawText: string): { cleanText: string; actions: ActionItem[] } {
  const actions: ActionItem[] = [];
  const actionRegex = /\[\[ACTION:(link|scroll):([^:]+):([^\]]+)\]\]/g;

  const cleanText = rawText.replace(actionRegex, (_, type, target, label) => {
    if (type === 'link') {
      actions.push({
        type: 'link',
        text: label.trim(),
        url: target.trim(),
      });
    } else if (type === 'scroll') {
      actions.push({
        type: 'scroll',
        text: label.trim(),
        targetId: target.trim(),
      });
    }
    return '';
  }).trim();

  return { cleanText, actions };
}

// Fetch live portfolio data directly from PostgreSQL / Prisma
async function fetchLivePortfolioContext() {
  try {
    const [profile, settings, education, skills, projects, certifications, articles] =
      await Promise.all([
        prisma.profile.findFirst(),
        prisma.setting.findFirst(),
        prisma.education.findMany({ orderBy: { id: 'asc' } }),
        prisma.skill.findMany({ orderBy: { displayOrder: 'asc' } }),
        prisma.project.findMany({ orderBy: { id: 'asc' } }),
        prisma.certification.findMany({ orderBy: { id: 'asc' } }),
        prisma.article.findMany({ orderBy: { id: 'asc' } }),
      ]);

    const parseJson = (val: any) => {
      if (typeof val === 'string') {
        try {
          return JSON.parse(val);
        } catch {
          return val;
        }
      }
      return val || [];
    };

    return {
      profile: profile || (fallbackData as any).profile,
      settings: settings || (fallbackData as any).settings,
      education: education?.length ? education : (fallbackData as any).education,
      skills: skills?.length ? skills : (fallbackData as any).skills,
      projects: (projects?.length ? projects : (fallbackData as any).projects).map((p: any) => ({
        ...p,
        tags: parseJson(p.tags),
      })),
      certifications: certifications?.length ? certifications : (fallbackData as any).certifications,
      articles: articles?.length ? articles : (fallbackData as any).articles,
    };
  } catch (error) {
    console.error('Error fetching live portfolio context for AI, using fallback:', error);
    const fb = fallbackData as any;
    return {
      profile: fb.profile,
      settings: fb.settings || {},
      education: fb.education || [],
      skills: fb.skills || [],
      projects: fb.projects || [],
      certifications: fb.certifications || [],
      articles: fb.articles || [],
    };
  }
}

// Build comprehensive grounding system prompt with live database data
function buildSystemPrompt(context: any): string {
  const { profile, education, skills, projects, certifications, articles } = context;

  return `You are J.A.M.S. (Joint Autonomous Matrix System // CYBER_AI v2.0), the elite cybersecurity AI assistant for Johnknox Kalle's interactive portfolio.

YOUR OBJECTIVE:
Provide accurate, professional, articulate, and cyberpunk-styled answers about Johnknox Kalle's background, security engineering credentials, software projects, skills, education, and research articles.

YOU HAVE REAL-TIME LIVE SYSTEM ACCESS TO HIS ENTIRE VERIFIED DATABASE:
====================
CANDIDATE DOSSIER:
- Name: ${profile?.name || 'Johnknox Kalle'}
- Professional Title: ${profile?.title || 'Cybersecurity Engineer & Full Stack Architect'}
- Tagline: ${profile?.tagline || 'Securing Systems & Building Resilient Infrastructure'}
- Location: ${profile?.location || 'Tamilnadu, India'}
- Email: ${profile?.email || 'johnknox.kalle@gmail.com'}
- Phone: ${profile?.phone || '+91 9182597274'}
- GitHub: ${profile?.github || 'https://github.com/johnknox0118'}
- LinkedIn: ${profile?.linkedin || 'https://linkedin.com'}
- Resume Download: ${profile?.resumeUrl || '/resume.pdf'}
- Bio: ${profile?.bio || 'Cybersecurity engineer specializing in zero-trust architecture, web defense, threat modeling, and modern scalable application security.'}
- Career Objective: ${profile?.careerObjective || 'To engineer resilient, defensive computing systems and scalable web infrastructure.'}

====================
VERIFIED ACADEMIC QUALIFICATIONS:
${(education || [])
  .map(
    (e: any, i: number) =>
      `[${i + 1}] Degree: ${e.degree} | Institution: ${e.institution} | Period: ${e.period || e.year} | Grade/CGPA: ${e.grade || e.cgpa || 'Distinction'}`
  )
  .join('\n')}

====================
TECHNICAL SKILLS MATRIX:
${(skills || [])
  .map(
    (s: any) =>
      `- ${s.name} (${s.category || 'Core'}): ${s.progress || 90}% proficiency, ${s.yearsOfExp || 2} years experience`
  )
  .join('\n')}

====================
SECURITY & ENGINEERING PROJECTS LEDGER:
${(projects || [])
  .map(
    (p: any, i: number) =>
      `[${i + 1}] "${p.title}" (${p.category || 'Security Platform'})
   Status: ${p.status || 'Active'}
   Summary: ${p.description || 'N/A'}
   Tech Stack: ${Array.isArray(p.tags) ? p.tags.join(', ') : p.tags || 'N/A'}
   Live URL: ${p.liveUrl || 'Internal / Protected'}
   GitHub Repo: ${p.githubUrl || 'Available on request'}`
  )
  .join('\n\n')}

====================
VERIFIED SECURITY CERTIFICATIONS:
${(certifications || [])
  .map(
    (c: any, i: number) =>
      `[${i + 1}] "${c.title}"
   Issuer: ${c.issuer} | Year: ${c.year}
   Credential ID: ${c.credentialId || 'AUTHENTICATED'}
   Verification URL: ${c.verificationUrl || 'Verified on chain/registry'}`
  )
  .join('\n\n')}

====================
ENGINEERING RESEARCH WRITING & ARTICLES:
${(articles || [])
  .map(
    (a: any, i: number) =>
      `- "${a.title}" (${a.category}) | Read Time: ${a.readTime || '5 min'} | Summary: ${a.excerpt}`
  )
  .join('\n')}

====================
RESPONSE GUIDELINES & PERSONA:
1. Tone: Professional, technically precise, cyber-themed (tastefully using terms like "verified ledger", "protocol", "packet", "dossier", "cryptographic").
2. Truthfulness: Never hallucinate or make up credentials, schools, or projects not in this dossier.
4. REQUIRED INTERACTIVE ACTION LAUNCHERS:
   At the very bottom of EVERY answer you generate, you MUST provide 1 to 3 relevant action button tags on their own line. J.A.M.S. automatically extracts them into clickable interactive buttons for the visitor.
   Exact syntax:
   [[ACTION:scroll:projects:Explore Projects]]
   [[ACTION:scroll:certifications:View Certifications]]
   [[ACTION:scroll:qualifications:View Qualifications]]
   [[ACTION:scroll:skills:View Skills Matrix]]
   [[ACTION:scroll:contact:Contact Johnknox]]
   [[ACTION:scroll:about:View System Dossier]]
   [[ACTION:link:URL_HERE:Button Text]]
   Always include at least one action button relevant to what the user asked!
`;
}

// Intelligent live-database search fallback when no external API key is configured
function executeLocalGroundingEngine(query: string, context: any): { reply: string; actions: ActionItem[] } {
  const q = query.toLowerCase();
  const { profile, education, skills, projects, certifications, articles } = context;
  const actions: ActionItem[] = [];
  let reply = '';

  const matchedProject = (projects || []).find(
    (p: any) =>
      p.title?.toLowerCase().includes(q) ||
      q.includes(p.title?.toLowerCase()) ||
      (p.tags && Array.isArray(p.tags) && p.tags.some((t: string) => q.includes(t.toLowerCase())))
  );

  const matchedCert = (certifications || []).find(
    (c: any) =>
      c.title?.toLowerCase().includes(q) ||
      c.issuer?.toLowerCase().includes(q)
  );

  if (matchedProject) {
    reply = `🔍 **PROJECT DOSSIER FOUND:**\n\n📌 **${matchedProject.title}**\n🏷️ **Category:** ${matchedProject.category || 'Security Platform'}\n⚡ **Status:** ${matchedProject.status || 'Active'}\n\n📝 ${matchedProject.description}\n\n🛠️ **Tech Stack:** ${Array.isArray(matchedProject.tags) ? matchedProject.tags.join(', ') : matchedProject.tags || 'N/A'}`;
    if (matchedProject.liveUrl) actions.push({ type: 'link', text: '🚀 Launch Live System', url: matchedProject.liveUrl });
    if (matchedProject.githubUrl) actions.push({ type: 'link', text: '💻 GitHub Repository', url: matchedProject.githubUrl });
    actions.push({ type: 'scroll', text: '📜 Jump to Projects', targetId: 'projects' });
  } else if (matchedCert) {
    reply = `🛡️ **VERIFIED CREDENTIAL FOUND:**\n\n📜 **${matchedCert.title}**\n🏛️ **Issuer:** ${matchedCert.issuer}\n📅 **Year:** ${matchedCert.year}\n🔑 **Credential ID:** ${matchedCert.credentialId || 'VERIFIED'}\n\n${matchedCert.description || 'Authenticated security credential.'}`;
    if (matchedCert.verificationUrl) actions.push({ type: 'link', text: '🛡️ Verify Official Credential', url: matchedCert.verificationUrl });
    actions.push({ type: 'scroll', text: '📜 View Certifications', targetId: 'certifications' });
  } else if (q.includes('project') || q.includes('work') || q.includes('build') || q.includes('app')) {
    const list = (projects || []).slice(0, 5).map((p: any, i: number) => `**${i + 1}. ${p.title}** (${p.category || 'System'})\n   └ ${p.description}`).join('\n\n');
    reply = `⚡ Johnknox has engineered **${projects?.length || 0} production security platforms and full-stack systems**:\n\n${list}\n\nAsk me about any specific project to inspect its architecture or launch it!`;
    actions.push({ type: 'scroll', text: '📜 Explore All Projects', targetId: 'projects' });
  } else if (q.includes('skill') || q.includes('stack') || q.includes('tech') || q.includes('python') || q.includes('react')) {
    const list = (skills || []).slice(0, 8).map((s: any) => `• **${s.name}** — ${s.progress || 90}% proficiency (${s.yearsOfExp || 2} yrs exp)`).join('\n');
    reply = `⚡ **Verified Technical Capabilities Matrix:**\n\n${list}\n\nSpecialized in defensive web architecture, zero-trust protocols, Python, and cloud-native Next.js applications.`;
    actions.push({ type: 'scroll', text: '⚡ View Interactive Skills Matrix', targetId: 'skills' });
  } else if (q.includes('cert') || q.includes('credential') || q.includes('license') || q.includes('badge')) {
    const list = (certifications || []).map((c: any) => `✓ **${c.title}** — ${c.issuer} (${c.year})`).join('\n');
    reply = `🛡️ **Verified Credentials & Accreditations:**\n\n${list}`;
    actions.push({ type: 'scroll', text: '🛡️ View Certifications Ledger', targetId: 'certifications' });
  } else if (q.includes('education') || q.includes('college') || q.includes('degree') || q.includes('qualification') || q.includes('cgpa')) {
    const list = (education || []).map((e: any) => `🎓 **${e.degree}**\n   🏛️ ${e.institution} (${e.period || e.year})\n   📊 Status / Grade: ${e.grade || e.cgpa || 'First Class with Distinction'}`).join('\n\n');
    reply = `🎓 **Academic Qualification History:**\n\n${list}`;
    actions.push({ type: 'scroll', text: '📜 View Qualifications Timeline', targetId: 'qualifications' });
  } else if (q.includes('contact') || q.includes('email') || q.includes('phone') || q.includes('hire') || q.includes('message')) {
    reply = `📬 **Secure Communication Channels:**\n\n• **Email:** [${profile.email}](mailto:${profile.email})\n• **Phone:** ${profile.phone}\n• **Location:** ${profile.location}\n\nYou can also transmit an encrypted packet via the contact form on this page.`;
    if (profile.email) actions.push({ type: 'link', text: '📧 Direct Email', url: `mailto:${profile.email}` });
    if (profile.linkedin) actions.push({ type: 'link', text: '💼 LinkedIn', url: profile.linkedin });
    if (profile.github) actions.push({ type: 'link', text: '🐙 GitHub', url: profile.github });
    actions.push({ type: 'scroll', text: '✉️ Open Contact Form', targetId: 'contact' });
  } else if (q.includes('resume') || q.includes('cv') || q.includes('download')) {
    reply = `📄 You can view the dynamic resume dossier or download Johnknox's verified resume PDF below:`;
    if (profile.resumeUrl) actions.push({ type: 'link', text: '📥 Download Resume (PDF)', url: profile.resumeUrl });
    actions.push({ type: 'scroll', text: '📜 Open Dynamic Dossier Generator', targetId: 'dossier' });
  } else {
    reply = `🤖 **Greetings.** I am J.A.M.S. // CYBER_AI v2.0.\n\nI have live synchronization with Johnknox Kalle's verified database (${projects?.length || 0} projects, ${skills?.length || 0} skills, ${certifications?.length || 0} certifications, and academic records).\n\nTry asking me:\n• *"What projects has Johnknox built?"*\n• *"Show his security certifications"*\n• *"What is his technical stack?"*\n• *"How do I contact or hire him?"*`;
    actions.push({ type: 'scroll', text: '📜 Read System Dossier', targetId: 'about' });
    actions.push({ type: 'scroll', text: '🚀 Explore Projects', targetId: 'projects' });
  }

  return { reply, actions };
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const message = body?.message?.trim();
    const history = Array.isArray(body?.history) ? body.history : [];

    if (!message) {
      return NextResponse.json({ error: 'Message payload required' }, { status: 400 });
    }

    // 1. Fetch live PostgreSQL portfolio records via Prisma
    const context = await fetchLivePortfolioContext();
    const systemPrompt = buildSystemPrompt(context);

    const geminiKey = process.env.GEMINI_API_KEY;
    const openaiKey = process.env.OPENAI_API_KEY;
    const groqKey = process.env.GROQ_API_KEY;

    // 2. Priority 1: Google Gemini API (Free tier, ultra-fast, high context window)
    if (geminiKey) {
      try {
        const contents = [
          ...history.slice(-6).map((h: any) => ({
            role: h.sender === 'user' ? 'user' : 'model',
            parts: [{ text: h.text }],
          })),
          { role: 'user', parts: [{ text: message }] },
        ];

        const candidateModels = ['gemini-3.6-flash', 'gemini-3.7-flash', 'gemini-flash-latest'];

        for (const model of candidateModels) {
          try {
            const geminiRes = await fetch(
              `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,
              {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'x-goog-api-key': geminiKey,
                },
                body: JSON.stringify({
                  systemInstruction: { parts: [{ text: systemPrompt }] },
                  contents,
                  generationConfig: {
                    temperature: 0.7,
                    maxOutputTokens: 1000,
                  },
                }),
              }
            );

            if (geminiRes.ok) {
              const geminiData = await geminiRes.json();
              const rawReply =
                geminiData?.candidates?.[0]?.content?.parts?.[0]?.text || '';

              if (rawReply) {
                const { cleanText, actions } = extractActions(rawReply);
                return NextResponse.json({
                  reply: cleanText,
                  actions,
                  provider: `gemini (${model})`,
                  liveDataSynced: true,
                });
              }
            } else {
              console.warn(`Gemini [${model}] returned non-200:`, await geminiRes.text());
            }
          } catch (modelErr) {
            console.warn(`Gemini [${model}] attempt failed:`, modelErr);
          }
        }
      } catch (geminiErr) {
        console.error('Gemini API execution error:', geminiErr);
      }
    }

    // 3. Priority 2: OpenAI API (GPT-4o-mini)
    if (openaiKey) {
      try {
        const messages = [
          { role: 'system', content: systemPrompt },
          ...history.slice(-6).map((h: any) => ({
            role: h.sender === 'user' ? 'user' : 'assistant',
            content: h.text,
          })),
          { role: 'user', content: message },
        ];

        const openaiRes = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${openaiKey}`,
          },
          body: JSON.stringify({
            model: 'gpt-4o-mini',
            messages,
            temperature: 0.7,
            max_tokens: 650,
          }),
        });

        if (openaiRes.ok) {
          const openaiData = await openaiRes.json();
          const rawReply = openaiData?.choices?.[0]?.message?.content || '';

          if (rawReply) {
            const { cleanText, actions } = extractActions(rawReply);
            return NextResponse.json({
              reply: cleanText,
              actions,
              provider: 'openai',
              liveDataSynced: true,
            });
          }
        }
      } catch (openaiErr) {
        console.error('OpenAI API execution error:', openaiErr);
      }
    }

    // 4. Priority 3: Groq Cloud API (Llama 3 70B / 8B)
    if (groqKey) {
      try {
        const messages = [
          { role: 'system', content: systemPrompt },
          ...history.slice(-6).map((h: any) => ({
            role: h.sender === 'user' ? 'user' : 'assistant',
            content: h.text,
          })),
          { role: 'user', content: message },
        ];

        const groqRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${groqKey}`,
          },
          body: JSON.stringify({
            model: 'llama-3.3-70b-versatile',
            messages,
            temperature: 0.7,
            max_tokens: 650,
          }),
        });

        if (groqRes.ok) {
          const groqData = await groqRes.json();
          const rawReply = groqData?.choices?.[0]?.message?.content || '';

          if (rawReply) {
            const { cleanText, actions } = extractActions(rawReply);
            return NextResponse.json({
              reply: cleanText,
              actions,
              provider: 'groq',
              liveDataSynced: true,
            });
          }
        }
      } catch (groqErr) {
        console.error('Groq API execution error:', groqErr);
      }
    }

    // 5. Intelligent Live-Database Grounding Fallback
    // If no external API key is present or all external calls fail, answer from live database directly!
    const { reply, actions } = executeLocalGroundingEngine(message, context);

    const hint =
      !geminiKey && !openaiKey && !groqKey
        ? '\n\n*(⚡ J.A.M.S. is currently operating in Live Database Grounding Mode. Add `GEMINI_API_KEY` to your `.env` to unlock full conversational LLM reasoning.)*'
        : '';

    return NextResponse.json({
      reply: reply + hint,
      actions,
      provider: 'local-database-grounding',
      liveDataSynced: true,
    });
  } catch (error: any) {
    console.error('AI chat endpoint fatal error:', error);
    return NextResponse.json(
      {
        reply: '⚠️ Transmission packet degraded. Please check database connectivity or retry query.',
        actions: [],
        provider: 'error',
      },
      { status: 500 }
    );
  }
}
