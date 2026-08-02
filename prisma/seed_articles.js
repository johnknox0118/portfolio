const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function seedArticles() {
  console.log('Seeding articles...');

  const count = await prisma.article.count();
  if (count === 0) {
    await prisma.article.create({
      data: {
        title: 'Zero-Trust Architecture in Modern Serverless & Next.js Environments',
        excerpt: 'Exploring cryptographic JWT session validation, role-based database access, and perimeter defense in serverless Next.js edge environments.',
        category: 'CYBERSECURITY',
        readTime: '6 min read',
        date: 'July 2026',
        tags: JSON.stringify(['Zero-Trust', 'Next.js', 'JWT', 'PostgreSQL', 'App Sec']),
        content: `### Overview
Modern web applications face sophisticated threat vectors targeting session persistence, API endpoints, and database connection pools. In this research paper, we analyze the implementation of Zero-Trust principles within Next.js App Router applications deployed to serverless environments.

### Core Defense Mechanisms
1. **Cryptographic Cookie Validation**: Rather than checking for simple cookie existence, tokens must undergo full structural inspection and signature verification.
2. **Database Connection Hardening**: Utilizing transactional connection poolers (pgbouncer) alongside session-level migrations prevents connection starvation attacks.
3. **MIME-Type & Payload Boundaries**: Enforcing strict binary byte inspection on upload gateways mitigates stored XSS and remote code execution vulnerabilities.

### Conclusion
By decoupling session state from volatile server memory and enforcing strict validation at every API perimeter, serverless applications maintain resilient defense postures.`,
      },
    });

    await prisma.article.create({
      data: {
        title: 'Building High-Performance 60FPS Interactive HUD Systems in React 19',
        excerpt: 'A deep dive into GPU-accelerated compositing, hardware transforms, and Framer Motion spring physics for zero-lag UI rendering.',
        category: 'ENGINEERING',
        readTime: '8 min read',
        date: 'June 2026',
        tags: JSON.stringify(['React 19', 'Performance', 'CSS GPU', 'Framer Motion']),
        content: `### Introduction
Creating immersive, futuristic HUD interfaces requires careful management of browser rendering pipelines to prevent layout thrashing and maintain 60 FPS animation loops.

### Key Optimization Strategies
- **GPU Layer Compositing**: Utilizing \`translate3d\` and \`will-change: transform\` forces elements onto hardware layers.
- **Debounced Pointer Hooks**: Normalizing mouse coordinates to normalized device coordinates prevents excessive React state re-renders.
- **Reduced Motion Fallbacks**: Respecting \`prefers-reduced-motion\` ensures accessibility without sacrificing aesthetic impact for hardware-capable devices.

### Summary
Combining declarative React state with hardware-composited canvas particle fields yields liquid-smooth animations across low-end and high-end hardware.`,
      },
    });

    console.log('Seeded 2 articles successfully.');
  } else {
    console.log(`Articles already seeded (${count} records).`);
  }
}

seedArticles().finally(() => prisma.$disconnect());
