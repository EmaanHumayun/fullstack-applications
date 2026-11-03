// Deterministic taxonomy dictionary for intelligent skills categorization
const CATEGORY_RULES = [
  {
    category: 'Programming Languages',
    keywords: [
      'python', 'javascript', 'typescript', 'java', 'c++', 'c#', 'c', 'go', 'golang',
      'rust', 'php', 'ruby', 'swift', 'kotlin', 'scala', 'r', 'dart', 'bash', 'shell',
      'powershell', 'sql', 'html', 'css', 'sass', 'scss'
    ]
  },
  {
    category: 'Backend Development',
    keywords: [
      'node.js', 'nodejs', 'node', 'express.js', 'express', 'fastapi', 'flask',
      'django', 'nest.js', 'nestjs', 'spring boot', 'spring', 'asp.net', '.net core',
      'graphql', 'rest api', 'rest apis', 'restful apis', 'grpc', 'microservices',
      'rabbitmq', 'kafka', 'bullmq', 'celery', 'jwt', 'oauth', 'rbac', 'socket.io',
      'websockets', 'websocket'
    ]
  },
  {
    category: 'Frontend Development',
    keywords: [
      'react', 'react.js', 'reactjs', 'next.js', 'nextjs', 'vue', 'vue.js', 'angular',
      'svelte', 'tailwind css', 'tailwind', 'bootstrap', 'material ui', 'redux',
      'zustand', 'vite', 'webpack', 'gsap', 'html5', 'css3', 'responsive design',
      'dom manipulation'
    ]
  },
  {
    category: 'Databases & Storage',
    keywords: [
      'postgresql', 'postgres', 'mongodb', 'mysql', 'sqlite', 'redis', 'elasticsearch',
      'cassandra', 'dynamodb', 'mariadb', 'supabase', 'firebase', 'prisma', 'mongoose',
      'typeorm', 'sqlalchemy', 'vector database', 'chromadb', 'faiss', 'pgvector'
    ]
  },
  {
    category: 'DevOps & Cloud',
    keywords: [
      'docker', 'kubernetes', 'k8s', 'terraform', 'aws', 'amazon web services', 'azure',
      'gcp', 'google cloud', 'ci/cd', 'github actions', 'gitlab ci', 'jenkins', 'linux',
      'ubuntu', 'nginx', 'apache', 'helm', 'prometheus', 'grafana', 'datadog', 'sre',
      'ansible', 'cloudformation', 'opentofu', 'containerization'
    ]
  },
  {
    category: 'AI & Machine Learning',
    keywords: [
      'ai agents', 'agentic ai', 'langchain', 'langgraph', 'pydantic', 'rag', 'llm',
      'llms', 'large language models', 'openai api', 'anthropic', 'gemini api',
      'prompt engineering', 'vector embeddings', 'hugging face', 'transformers',
      'pytorch', 'tensorflow', 'scikit-learn', 'deep learning', 'fine-tuning'
    ]
  },
  {
    category: 'Automation & Integrations',
    keywords: [
      'webhooks', 'webhook', 'zapier', 'make', 'n8n', 'api integration', 'etl pipelines',
      'workflow automation', 'puppeteer', 'playwright', 'selenium', 'cron jobs',
      'stripe api', 'sendgrid', 'twilio', 'airtable', 'notion api', 'slack api'
    ]
  },
  {
    category: 'Tools & Utilities',
    keywords: [
      'git', 'github', 'gitlab', 'postman', 'insomnia', 'vscode', 'visual studio code',
      'jira', 'confluence', 'figma', 'npm', 'pnpm', 'yarn', 'eslint', 'prettier',
      'jest', 'pytest', 'mocha', 'cypress'
    ]
  },
  {
    category: 'Soft Skills',
    keywords: [
      'problem solving', 'system design', 'technical writing', 'code review',
      'agile methodology', 'scrum', 'leadership', 'team collaboration', 'communication',
      'critical thinking', 'project management'
    ]
  }
];

export function parseRawSkills(rawText) {
  if (!rawText || typeof rawText !== 'string') return [];

  // Split on commas, newlines, semicolons, or pipe characters
  const rawTokens = rawText.split(/[,;\n|]+/);

  const seen = new Set();
  const cleaned = [];

  for (const token of rawTokens) {
    const trimmed = token.trim();
    if (!trimmed) continue;

    // Check lowercase for deduplication
    const lower = trimmed.toLowerCase();
    if (seen.has(lower)) continue;
    seen.add(lower);

    cleaned.push(trimmed);
  }

  return cleaned;
}

export function autoCategorizeSkills(skillList) {
  if (!Array.isArray(skillList) || skillList.length === 0) return [];

  const categoryBuckets = {};

  // Initialize standard buckets in logical order
  const standardCategories = [
    'Programming Languages',
    'Backend Development',
    'Frontend Development',
    'Databases & Storage',
    'DevOps & Cloud',
    'AI & Machine Learning',
    'Automation & Integrations',
    'Tools & Utilities'
  ];

  standardCategories.forEach(cat => {
    categoryBuckets[cat] = [];
  });
  categoryBuckets['Other Competencies'] = [];

  for (const skill of skillList) {
    const lower = skill.toLowerCase();
    let matchedCat = null;

    for (const rule of CATEGORY_RULES) {
      if (rule.keywords.some(k => lower === k || lower.includes(k) || k.includes(lower))) {
        matchedCat = rule.category;
        break;
      }
    }

    if (matchedCat) {
      if (!categoryBuckets[matchedCat]) categoryBuckets[matchedCat] = [];
      categoryBuckets[matchedCat].push(skill);
    } else {
      categoryBuckets['Other Competencies'].push(skill);
    }
  }

  // Filter out empty buckets
  return Object.entries(categoryBuckets)
    .filter(([_, list]) => list.length > 0)
    .map(([name, skills]) => ({ name, skills }));
}
