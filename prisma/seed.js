const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function main() {
  console.log('Cleaning up database...');
  await prisma.admin.deleteMany({});
  await prisma.profile.deleteMany({});
  await prisma.education.deleteMany({});
  await prisma.timelineEvent.deleteMany({});
  await prisma.skill.deleteMany({});
  await prisma.project.deleteMany({});
  await prisma.certification.deleteMany({});
  await prisma.internship.deleteMany({});
  await prisma.achievement.deleteMany({});
  await prisma.galleryItem.deleteMany({});
  await prisma.setting.deleteMany({});
  await prisma.message.deleteMany({});

  console.log('Seeding admin account...');
  const passwordHash = await bcrypt.hash('cybersecurity2026', 10);
  await prisma.admin.create({
    data: {
      username: 'admin',
      password: passwordHash,
    },
  });

  console.log('Seeding portfolio settings...');
  await prisma.setting.create({
    data: {
      theme: 'dark',
      primaryColor: '#00FF9D',
      secondaryColor: '#00C8FF',
      accentColor: '#00e5ff',
      loader: 'cyber',
      analyticsId: 'G-XXXXXXXXXX',
      footerText: 'Secure Systems & Resilient Infrastructure',
    },
  });

  console.log('Seeding profile information...');
  await prisma.profile.create({
    data: {
      name: 'Alex Thorne',
      title: 'Cybersecurity Architect & Incident Responder',
      tagline: 'Defending critical infrastructure, auditing network integrity, and designing zero-trust enterprise security architectures.',
      bio: 'Detail-oriented Cybersecurity engineer and undergraduate researcher with a deep focus on threat hunting, reverse engineering, and endpoint containment. Demonstrated success in national level Capture the Flag (CTF) competitions, defensive operations, and full-stack secure engineering. Specialized in hardening systems, micro-segmentation, and deploying AI-driven intrusion detection engines.',
      careerObjective: 'To secure resilient, scalable digital environments as a Security Architect, leveraging deep competencies in cryptography, vulnerability assessment, and threat emulation to preempt sophisticated modern exploits.',
      location: 'Boston, MA, USA',
      phone: '+1 (555) 019-2831',
      email: 'alex.thorne.sec@gmail.com',
      linkedin: 'linkedin.com/in/alex-thorne-cyber',
      github: 'github.com/alex-thorne-sec',
      instagram: 'instagram.com/alex_sec_ops',
      twitter: 'x.com/alex_thorne_sec',
      portfolioUrl: 'alex-thorne-security.vercel.app',
      resumeUrl: '/uploads/Alex_Thorne_Resume.pdf',
      cvUrl: '/uploads/Alex_Thorne_CV.pdf',
      profileImageUrl: '/uploads/profile_avatar.png',
      coverImageUrl: '/uploads/matrix_bg.png',
      profileImageGrayscale: '100',
      profileImageScale: '1.0',
      profileImageBorderColor: '#00FF9D',
    },
  });

  console.log('Seeding achievements/counters...');
  const counters = [
    { label: 'CTFs Competed', value: '25+', icon: 'Flag' },
    { label: 'Vulnerabilities Reported', value: '15', icon: 'ShieldAlert' },
    { label: 'Security Tools Authored', value: '8', icon: 'Code' },
    { label: 'Certifications Verified', value: '12', icon: 'Award' },
  ];
  for (const item of counters) {
    await prisma.achievement.create({ data: item });
  }

  console.log('Seeding education data...');
  await prisma.education.create({
    data: {
      degree: 'B.S. in Computer Science (Cyber Security Focus)',
      institution: 'Northeastern University',
      duration: '2023 - 2027 (Expected)',
      grade: 'GPA: 3.92 / 4.00',
      description: 'Advanced coursework in Cryptography, Advanced Computer Networks, Operating System Kernels, Malware Analysis, and Intrusion Detection Systems. Research assistant in the Secure Systems Lab.',
    },
  });

  console.log('Seeding timeline events...');
  const events = [
    {
      title: 'Malware Analyst Intern',
      description: 'Assisted in reverse-engineering ransomware families and implementing static/dynamic behavioral analysis reports in sandbox environments.',
      date: 'June 2025 - Present',
      category: 'experience',
      icon: 'ShieldAlert',
      displayOrder: 1,
    },
    {
      title: 'Security Operations Intern',
      description: 'Monitored SOC alert queues, triaged network anomalies, and tuned Snort and Suricata IDS rules to minimize false positives.',
      date: 'June 2024 - Sept 2024',
      category: 'experience',
      icon: 'Activity',
      displayOrder: 2,
    },
    {
      title: 'National Cyber League CTF - Finalist',
      description: 'Finished in the top 1.5% individually in a pool of 8,000+ national competitors across challenges in cryptography, log analysis, and network auditing.',
      date: 'April 2025',
      category: 'award',
      icon: 'Trophy',
      displayOrder: 3,
    },
  ];
  for (const ev of events) {
    await prisma.timelineEvent.create({ data: ev });
  }

  console.log('Seeding skills database...');
  const skills = [
    { name: 'Penetration Testing', logo: 'Shield', progress: 95, category: 'cybersecurity', displayOrder: 1, yearsOfExp: 3 },
    { name: 'Incident Response', logo: 'Flame', progress: 88, category: 'cybersecurity', displayOrder: 2, yearsOfExp: 2 },
    { name: 'Reverse Engineering', logo: 'Cpu', progress: 80, category: 'cybersecurity', displayOrder: 3, yearsOfExp: 2 },
    { name: 'Python (Security Tooling)', logo: 'Code', progress: 92, category: 'programming', displayOrder: 1, yearsOfExp: 4 },
    { name: 'C++ Systems Development', logo: 'Terminal', progress: 85, category: 'programming', displayOrder: 2, yearsOfExp: 3 },
    { name: 'TypeScript / React', logo: 'Globe', progress: 75, category: 'frontend', displayOrder: 1, yearsOfExp: 2 },
    { name: 'Wireshark & Packet Analysis', logo: 'Activity', progress: 95, category: 'networking', displayOrder: 1, yearsOfExp: 3 },
    { name: 'Linux Kernel Hardening', logo: 'Settings', progress: 90, category: 'os', displayOrder: 1, yearsOfExp: 3 },
    { name: 'Docker & Container Security', logo: 'Database', progress: 85, category: 'cloud', displayOrder: 1, yearsOfExp: 2 },
  ];
  for (const sk of skills) {
    await prisma.skill.create({ data: sk });
  }

  console.log('Seeding certifications...');
  const certifications = [
    {
      title: 'CompTIA Security+',
      issuer: 'CompTIA',
      year: '2024',
      category: 'certification',
      description: 'Global certification demonstrating fundamental competencies in network security, threat management, and compliance operations.',
      icon: 'ShieldCheck',
      imageUrl: '/placeholder_cert.jpg',
      credentialId: 'SEC-918239A',
      verificationUrl: 'https://comptia.org/verify',
      longDescription: 'Covers core skills in secure architecture design, threat analysis, access control configuration, cryptography implementation, and incident triage protocol.',
      grade: 'Pass',
      skills: JSON.stringify(['Risk Mitigation', 'Network Security', 'Access Controls']),
    },
    {
      title: 'Certified Ethical Hacker (CEH) Practice',
      issuer: 'EC-Council',
      year: '2025',
      category: 'certification',
      description: 'Hands-on practical certification testing skills in active network scans, vulnerability exploits, and system compromising vectors.',
      icon: 'Terminal',
      imageUrl: '/placeholder_cert.jpg',
      credentialId: 'CEHP-092831',
      verificationUrl: 'https://eccouncil.org/verify',
      longDescription: 'Simulates a 6-hour hacking challenge evaluating competence in scanning networks, pivoting hosts, bypassing firewalls, hijacking active directories, and cracking hashes.',
      grade: 'Score: 92%',
      skills: JSON.stringify(['System Hacking', 'Nmap Scanning', 'SQL Injection', 'Pivoting']),
    },
  ];
  for (const cert of certifications) {
    await prisma.certification.create({ data: cert });
  }

  console.log('Seeding internship timeline...');
  await prisma.internship.create({
    data: {
      companyName: 'Secure Networks Corp',
      role: 'Malware Analyst & Security Intern',
      duration: 'May 2025 - August 2025',
      description: 'Analyzed malicious binaries using Ghidra and IDA Pro, drafted threat profiles, and integrated indicators of compromise (IOCs) into security log architectures.',
      skills: JSON.stringify(['Ghidra', 'Malware Analysis', 'YARA Rules', 'Reverse Engineering']),
      logoUrl: '/placeholder_logo.png',
      offerLetterUrl: '/placeholder_offer.pdf',
      completionCertificateUrl: '/placeholder_completion.pdf',
    },
  });

  console.log('Seeding portfolio projects...');
  const projects = [
    {
      title: 'SentinelGrid-IDS',
      description: 'AI-driven network intrusion detection and behavioral monitoring suite.',
      role: 'Lead Architect & ML Engineer',
      timeline: 'Jan 2025 - May 2025',
      event: 'Cyber Security Research Showcase',
      fullDescription: 'Architected and built SentinelGrid, a security operations center system that processes high-throughput traffic and flags suspicious lateral movements using IsolationForest and LSTM models. Delivers real-time telemetry pipelines directly to a web console via WebSocket streaming.',
      githubUrl: 'https://github.com/alex-thorne-sec/sentinelgrid-ids',
      liveUrl: 'https://sentinelgrid-demo.vercel.app',
      imageUrl: '/placeholder_project.jpg',
      status: 'completed',
      category: 'cybersecurity',
      screenshots: JSON.stringify(['/placeholder_screenshot.jpg']),
      tags: JSON.stringify(['Python', 'PyTorch', 'React', 'Tailwind', 'WebSockets']),
      challenges: JSON.stringify([
        'Processing 10,000+ packets/second under microsecond timing bounds without losing context.',
        'Avoiding high false-positive alarms under standard heavy developer environments.',
      ]),
      solutions: JSON.stringify([
        'Implemented multiprocessing queues in Python paired with lightweight C++ network captures.',
        'Trained dynamic sliding-window thresholds that continuously self-calibrate based on local subnets.',
      ]),
      logs: JSON.stringify([
        '[SYS] Initializing SentinelGrid IDS Core...',
        '[OK] Packet interface eth0 bound successfully.',
        '[ML] LSTM weights loaded (Inference: 14ms).',
        '[WARN] Anomaly: Port scanning detected from host 192.168.1.42.',
        '[ACT] Firewall rules auto-updated. Host quarantined.',
      ]),
    },
    {
      title: 'Cryptographic File System (CFS)',
      description: 'A customized encrypted endpoint storage utility maintaining directory state integrity.',
      role: 'Systems Developer',
      timeline: 'Oct 2024 - Dec 2024',
      event: 'Open Source Personal Release',
      fullDescription: 'Developed an endpoint storage shell that encrypts user file directories on the fly. Employs PBKDF2 for key derivation and AES-GCM 256-bit cryptography to prevent data tampering, enforcing file protection at rest.',
      githubUrl: 'https://github.com/alex-thorne-sec/cfs-cryptography',
      liveUrl: '',
      imageUrl: '/placeholder_project.jpg',
      status: 'completed',
      category: 'cybersecurity',
      screenshots: JSON.stringify(['/placeholder_screenshot.jpg']),
      tags: JSON.stringify(['C++', 'OpenSSL', 'Cryptography', 'File Systems']),
      challenges: JSON.stringify([
        'Mitigating side-channel memory leaks of master encryption keys.',
        'Preventing complete directory corruption if file operations fail mid-flight.',
      ]),
      solutions: JSON.stringify([
        'Utilized zeroed-memory arrays and locked RAM blocks via mlock calls.',
        'Designed transactional write routines using shadow directories to assure data integrity.',
      ]),
      logs: JSON.stringify([
        '[SYS] Launching CFS Cryptographic Provider...',
        '[OK] OpenSSL security modules verified.',
        '[SYS] Reading directory mapping index...',
        '[OK] Directory decrypted. State loaded securely.',
      ]),
    },
  ];
  for (const prj of projects) {
    await prisma.project.create({ data: prj });
  }

  console.log('Seeding gallery elements...');
  const galleryItems = [
    { imageUrl: '/placeholder_gallery.jpg', caption: 'Secure Systems Hackathon Hack-it 2025', category: 'hackathon' },
    { imageUrl: '/placeholder_gallery.jpg', caption: 'Research Presentation at CyberSec-Con', category: 'event' },
  ];
  for (const gal of galleryItems) {
    await prisma.galleryItem.create({ data: gal });
  }

  console.log('Database seeding successfully finished!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
