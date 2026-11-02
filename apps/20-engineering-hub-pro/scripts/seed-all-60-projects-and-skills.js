import 'dotenv/config';
import mongoose from 'mongoose';

// Project Catalogs
const BACKEND_PROJECTS = [
  { num: 1, level: 'Beginner', title: 'Task Manager REST API', slug: 'backend-01-task-manager-rest-api', completed: true, progress: 100, tech: ['Node.js', 'Express', 'JWT', 'REST'], useCase: 'Stateless task tracking backend with secure authentication and schema validation.', concepts: ['HTTP Methods', 'Middleware', 'JWT Authentication', 'Error Handling'] },
  { num: 2, level: 'Beginner', title: 'Contact Management API', slug: 'backend-02-contact-management-api', tech: ['Node.js', 'Express', 'SQLite', 'Joi'], useCase: 'Address book backend with relational categorization, search filters, and input validation.', concepts: ['Database Constraints', 'Query Filtering', 'CRUD API Design'] },
  { num: 3, level: 'Beginner', title: 'URL Shortener Service', slug: 'backend-03-url-shortener', tech: ['Node.js', 'Express', 'PostgreSQL', 'Base62'], useCase: 'High-speed URL redirection engine with analytical click-event logging and collision resolution.', concepts: ['Base62 Encoding', 'Database Indexing', 'HTTP 301/302 Redirects'] },
  { num: 4, level: 'Beginner', title: 'Authentication & Session Service', slug: 'backend-04-authentication-api', tech: ['Node.js', 'Express', 'bcrypt', 'JWT', 'PostgreSQL'], useCase: 'Hardened identity provider with refresh tokens, password hashing, and token revocation lists.', concepts: ['Salt Rounds', 'Refresh Token Rotation', 'CSRF Protection'] },
  { num: 5, level: 'Beginner', title: 'File Upload and Media API', slug: 'backend-05-file-upload-media-api', tech: ['Node.js', 'Express', 'Multer', 'Sharp', 'S3'], useCase: 'Multi-part media ingestion service with image optimization, magic-byte validation, and cloud storage.', concepts: ['MIME Validation', 'Streaming Uploads', 'Presigned URLs'] },
  { num: 6, level: 'Intermediate', title: 'Role-Based Access Control (RBAC) System', slug: 'backend-06-rbac-system', tech: ['Node.js', 'Express', 'PostgreSQL', 'Prisma'], useCase: 'Hierarchical permission engine evaluating fine-grained actions across tenant organizations.', concepts: ['RBAC vs ABAC', 'Policy Enforcement Points', 'Database Relations'] },
  { num: 7, level: 'Intermediate', title: 'E-commerce Catalog Backend API', slug: 'backend-07-ecommerce-backend-api', tech: ['Node.js', 'Fastify', 'PostgreSQL', 'Redis'], useCase: 'Multi-category product catalog with tiered pricing, facet filtering, and Redis query caching.', concepts: ['Cache Aside Pattern', 'Composite Indexes', 'Connection Pooling'] },
  { num: 8, level: 'Intermediate', title: 'Content Management (CMS) API', slug: 'backend-08-blog-cms-api', tech: ['Node.js', 'Express', 'MongoDB', 'Mongoose'], useCase: 'Publishing engine supporting drafted revisions, tagging taxonomy, and nested discussion threads.', concepts: ['Document Modeling', 'Aggregation Pipeline', 'Pagination'] },
  { num: 9, level: 'Intermediate', title: 'Notification Microservice', slug: 'backend-09-notification-service', tech: ['Node.js', 'BullMQ', 'Redis', 'Nodemailer'], useCase: 'Asynchronous multi-channel dispatch engine routing transactional emails, SMS, and push notifications.', concepts: ['Message Queues', 'Worker Pools', 'Dead Letter Queues'] },
  { num: 10, level: 'Intermediate', title: 'API Integration and Webhook Platform', slug: 'backend-10-api-integration-webhook-platform', tech: ['Node.js', 'Express', 'Redis', 'Crypto'], useCase: 'Webhook delivery system providing HMAC signing, exponential backoff retries, and replay defense.', concepts: ['Idempotency Keys', 'HMAC SHA-256 Verification', 'Retry Policies'] },
  { num: 11, level: 'Advanced', title: 'Modular Monolithic SaaS Backend', slug: 'backend-11-modular-monolithic-saas-backend', tech: ['TypeScript', 'Express', 'PostgreSQL', 'Docker'], useCase: 'Domain-Driven Design (DDD) backend with strictly partitioned domain boundaries and shared kernel.', concepts: ['Bounded Contexts', 'Dependency Injection', 'Transaction Boundaries'] },
  { num: 12, level: 'Advanced', title: 'High-Performance API Gateway', slug: 'backend-12-api-gateway', tech: ['Node.js', 'Fastify', 'Redis', 'JWT'], useCase: 'Reverse proxy gateway terminating TLS, validating JWTs, rate-limiting IPs, and reverse-routing.', concepts: ['Token Bucket Algorithm', 'Reverse Proxy Routing', 'Circuit Breakers'] },
  { num: 13, level: 'Advanced', title: 'Real-Time WebSocket Chat Backend', slug: 'backend-13-real-time-chat-backend', tech: ['Node.js', 'Socket.io', 'Redis PubSub', 'PostgreSQL'], useCase: 'Distributed chat cluster utilizing Redis Pub/Sub for horizontal scaling across instances.', concepts: ['WebSocket Handshakes', 'Redis Adapter', 'Presence Detection'] },
  { num: 14, level: 'Advanced', title: 'Advanced Search and Analytics API', slug: 'backend-14-advanced-search-analytics-api', tech: ['Node.js', 'Elasticsearch', 'PostgreSQL', 'Logstash'], useCase: 'Full-text search engine with fuzzy matching, tokenized analyzers, and aggregation analytics.', concepts: ['Inverted Indexes', 'Fuzzy Matching', 'Change Data Capture (CDC)'] },
  { num: 15, level: 'Advanced', title: 'Backend Testing and Security Platform', slug: 'backend-15-backend-testing-security-platform', tech: ['Jest', 'Supertest', 'OWASP ZAP', 'Docker'], useCase: 'Automated test harness executing integration tests, SQL injection audits, and load benchmarks.', concepts: ['Test Driven Development', 'DAST Scanning', 'Chaos Engineering'] },
  { num: 16, level: 'Professional', title: 'Microservices E-commerce Platform', slug: 'backend-16-microservices-ecommerce-platform', tech: ['Node.js', 'gRPC', 'Docker', 'Kubernetes'], useCase: 'Decoupled service ecosystem communicating via synchronous gRPC and asynchronous Kafka streams.', concepts: ['Protocol Buffers', 'Service Discovery', 'Distributed Tracing'] },
  { num: 17, level: 'Professional', title: 'Event-Driven Order Processing System', slug: 'backend-17-event-driven-order-processing', tech: ['Node.js', 'Apache Kafka', 'PostgreSQL', 'Docker'], useCase: 'Financial checkout pipeline with Outbox pattern, Saga orchestration, and compensation transactions.', concepts: ['Saga Pattern', 'Transactional Outbox', 'Eventual Consistency'] },
  { num: 18, level: 'Professional', title: 'Distributed Job Processing Engine', slug: 'backend-18-distributed-job-processing', tech: ['Go / Node.js', 'Redis', 'PostgreSQL', 'Prometheus'], useCase: 'Fault-tolerant distributed task coordinator supporting cron schedules, heartbeats, and leader election.', concepts: ['Distributed Locks', 'Leader Election', 'Graceful Shutdown'] },
  { num: 19, level: 'Professional', title: 'Scalable Booking & Reservation Engine', slug: 'backend-19-scalable-booking-reservation-backend', tech: ['Node.js', 'PostgreSQL', 'Redis', 'K6'], useCase: 'High-contention reservation engine enforcing pessimistic locking and serializable isolation.', concepts: ['Pessimistic vs Optimistic Locking', 'Race Conditions', 'Serializable Transactions'] },
  { num: 20, level: 'Professional', title: 'Production-Ready Enterprise SaaS Backend', slug: 'backend-20-production-ready-saas-backend', tech: ['TypeScript', 'Express', 'PostgreSQL', 'Kubernetes', 'Helm'], useCase: 'Multi-tenant cloud backend with schema-per-tenant isolation, automated migrations, and zero downtime.', concepts: ['Multi-Tenancy Architectures', 'Zero-Downtime Migration', 'OpenTelemetry Tracing'] }
];

const AUTOMATION_PROJECTS = [
  { num: 1, level: 'Beginner', title: 'Automated Email Notification System', slug: 'automation-01-automated-email-notification-system', completed: true, progress: 100, tech: ['Node.js', 'Express', 'Nodemailer', 'Joi'], useCase: 'Validated transactional email dispatcher with batch throttling and HTML template rendering.', concepts: ['SMTP Handshakes', 'Rate Throttling', 'Template Interpolation'] },
  { num: 2, level: 'Beginner', title: 'Google Sheets Data Automation', slug: 'automation-02-google-sheets-data-automation', tech: ['Python', 'Google Sheets API', 'OAuth2', 'Pandas'], useCase: 'Automated sync script fetching API records and updating structured Google spreadsheets.', concepts: ['OAuth2 Service Accounts', 'Spreadsheet Batch Updates', 'Data Sanitization'] },
  { num: 3, level: 'Beginner', title: 'Form Submission Processing Automation', slug: 'automation-03-form-submission-automation', tech: ['Node.js', 'Express', 'Webhook', 'Slack API'], useCase: 'Ingestion pipeline validating webhook submissions, deduplicating leads, and alerting team channels.', concepts: ['Payload Validation', 'Slack Webhooks', 'Deduplication'] },
  { num: 4, level: 'Beginner', title: 'Automated File Management & Sorter', slug: 'automation-04-automated-file-management-system', tech: ['Python', 'Watchdog', 'Pathlib', 'Cron'], useCase: 'Filesystem event daemon organizing, compressing, and archiving downloaded assets by extension and date.', concepts: ['OS File Watchers', 'Gzip Compression', 'POSIX Permissions'] },
  { num: 5, level: 'Beginner', title: 'Multi-API Data Integration Pipeline', slug: 'automation-05-multi-api-data-integration-system', tech: ['Python', 'Requests', 'SQLite', 'Tenacity'], useCase: 'Synchronous aggregator querying multiple REST endpoints with retry backoff and data normalization.', concepts: ['Exponential Backoff', 'Schema Harmonization', 'SQLite Persistence'] },
  { num: 6, level: 'Intermediate', title: 'CRM Lead Management Automation', slug: 'automation-06-crm-lead-management-automation', tech: ['Node.js', 'HubSpot API', 'PostgreSQL', 'Webhooks'], useCase: 'Bidirectional lead synchronizer enforcing field mapping, conflict resolution, and change tracking.', concepts: ['Delta Syncing', 'Conflict Resolution', 'Rate Limit Management'] },
  { num: 7, level: 'Intermediate', title: 'E-commerce Order Processing Automation', slug: 'automation-07-ecommerce-order-automation', tech: ['Node.js', 'Stripe API', 'Shopify Webhooks', 'SendGrid'], useCase: 'Event-driven order fulfillment workflow triggering invoice generation, inventory hold, and tracking emails.', concepts: ['Stripe Signatures', 'Inventory Reservation', 'Asynchronous Pipeline'] },
  { num: 8, level: 'Intermediate', title: 'Social Media Publishing Automation', slug: 'automation-08-social-media-content-publishing-automation', tech: ['Python', 'FastAPI', 'Twitter API', 'LinkedIn API'], useCase: 'Content staging platform queueing posts, verifying asset dimensions, and publishing on schedule.', concepts: ['Scheduled Tasks', 'Media Transcoding', 'Multi-Platform OAuth'] },
  { num: 9, level: 'Intermediate', title: 'Customer Support Ticket Automation', slug: 'automation-09-customer-support-ticket-automation', tech: ['Python', 'Zendesk API', 'NLP / spaCy', 'PostgreSQL'], useCase: 'Triage automation parsing inbound ticket content, assigning priority tags, and routing to specialists.', concepts: ['Rule Engines', 'Entity Extraction', 'SLA Tracking'] },
  { num: 10, level: 'Intermediate', title: 'Invoice and Payment Reconciliation Automation', slug: 'automation-10-invoice-payment-reconciliation-automation', tech: ['Python', 'Pandas', 'Stripe API', 'QuickBooks API'], useCase: 'Financial audit script cross-referencing bank gateway deposits with invoice records to detect mismatches.', concepts: ['Record Reconciliation', 'Floating-Point Tolerance', 'Discrepancy Reporting'] },
  { num: 11, level: 'Advanced', title: 'Custom Integration Platform', slug: 'automation-11-custom-integration-platform', tech: ['TypeScript', 'Node.js', 'Express', 'PostgreSQL'], useCase: 'Self-hosted integration engine with visual drag-and-drop connectors and custom transformation scripts.', concepts: ['Dynamic Connectors', 'AST Sandbox Evaluation', 'Execution Graphs'] },
  { num: 12, level: 'Advanced', title: 'Advanced Workflow Orchestration Engine', slug: 'automation-12-advanced-workflow-orchestration-engine', tech: ['Python', 'Prefect / Celery', 'Redis', 'Docker'], useCase: 'DAG workflow coordinator managing task dependencies, automated retries, and failure alerts.', concepts: ['DAG Topo Sorting', 'State Recovery', 'Worker Concurrency'] },
  { num: 13, level: 'Advanced', title: 'Event-Driven Webhook Broker', slug: 'automation-13-event-driven-automation-platform', tech: ['Node.js', 'RabbitMQ', 'Redis', 'PostgreSQL'], useCase: 'High-throughput webhook router guaranteeing at-least-once delivery with exponential backoff and replay buffer.', concepts: ['At-Least-Once Delivery', 'Message Acknowledgments', 'Replay Buffers'] },
  { num: 14, level: 'Advanced', title: 'Data Synchronization & ETL Pipeline Engine', slug: 'automation-14-data-synchronization-etl-pipeline', tech: ['Python', 'DuckDB', 'Apache Arrow', 'PostgreSQL'], useCase: 'Scalable data pipeline extracting gigabyte datasets, transforming schemas in-memory, and upserting data.', concepts: ['Batch Ingestion', 'Schema Evolution', 'Upsert Operations'] },
  { num: 15, level: 'Advanced', title: 'AI-Powered Business Automation System', slug: 'automation-15-ai-powered-business-automation-system', tech: ['Python', 'OpenAI API', 'FastAPI', 'PostgreSQL'], useCase: 'Autonomous processor extracting structured JSON from raw receipts, contracts, and unstructured invoices.', concepts: ['Structured Extraction', 'JSON Schema Guardrails', 'Human-in-the-Loop'] },
  { num: 16, level: 'Professional', title: 'DevOps Infrastructure Auto-Remediation Platform', slug: 'automation-16-devops-infrastructure-automation-platform', tech: ['Python', 'Docker SDK', 'Kubernetes API', 'Prometheus'], useCase: 'Automated SRE daemon detecting failing pods or disk exhaustion and executing automated runbooks.', concepts: ['Self-Healing Systems', 'Webhook Web-Receivers', 'Remediation Runbooks'] },
  { num: 17, level: 'Professional', title: 'CI/CD and GitHub Automation Platform', slug: 'automation-17-cicd-github-automation-platform', tech: ['Node.js', 'GitHub Probot', 'Octokit', 'Docker'], useCase: 'Enterprise GitHub bot automating PR compliance checks, semver releases, preview deployments, and changelogs.', concepts: ['GitHub App Permissions', 'Semantic Versioning', 'Automated Branch Strategy'] },
  { num: 18, level: 'Professional', title: 'Cloud Resource Management & Automation System', slug: 'automation-18-cloud-resource-management-automation-system', tech: ['Python', 'Boto3 (AWS)', 'Terraform', 'Vault'], useCase: 'Multi-account cloud governor stopping idle EC2s, rotating IAM keys, and enforcing encryption tags.', concepts: ['Cloud Governance', 'Automated FinOps', 'Secret Rotation'] },
  { num: 19, level: 'Professional', title: 'Multi-Agent Business Process Automation System', slug: 'automation-19-multi-agent-business-process-automation-system', tech: ['Python', 'LangGraph', 'FastAPI', 'Redis'], useCase: 'Coordinated agent cluster handling complex RFPs: parsing, compliance verification, and draft pricing.', concepts: ['Multi-Agent Coordination', 'State Machine Routing', 'Audit Ledgers'] },
  { num: 20, level: 'Professional', title: 'Enterprise Automation & Integration Platform', slug: 'automation-20-enterprise-automation-integration-platform', tech: ['TypeScript', 'Fastify', 'Kafka', 'PostgreSQL', 'Kubernetes'], useCase: 'Production-grade enterprise integration engine with strict mTLS, audit trails, and multi-tenant isolation.', concepts: ['Zero-Trust Architecture', 'End-to-End Tracing', 'Enterprise RBAC'] }
];

const AI_AGENT_PROJECTS = [
  { num: 1, level: 'Beginner', title: 'Intelligent AI Chat Agent', slug: 'ai-agent-01-intelligent-chat-agent', completed: true, progress: 100, tech: ['Python', 'OpenAI API', 'Pydantic'], useCase: 'Deterministic console chat agent with streaming responses, conversation history, and system instructions.', concepts: ['LLM Inference', 'Context Window Management', 'Prompt Framing'] },
  { num: 2, level: 'Beginner', title: 'Tool-Calling AI Agent', slug: 'ai-agent-02-tool-calling-agent', tech: ['Python', 'OpenAI API', 'Pydantic', 'Requests'], useCase: 'Function-calling agent invoking calculator, currency converter, and weather tools via schema validation.', concepts: ['Function Calling Schema', 'Tool Execution Loop', 'Error Recovery'] },
  { num: 3, level: 'Beginner', title: 'AI Research Assistant', slug: 'ai-agent-03-research-assistant', tech: ['Python', 'DuckDuckGo API', 'BeautifulSoup4', 'OpenAI'], useCase: 'Automated research worker scraping web articles, extracting key takeaways, and compiling citations.', concepts: ['Web Scraping Sanitation', 'Source Attribution', 'Document Synthesis'] },
  { num: 4, level: 'Beginner', title: 'Personal Productivity Agent', slug: 'ai-agent-04-personal-productivity-agent', tech: ['Python', 'SQLite', 'Pydantic', 'Datetime'], useCase: 'Interactive CLI agent managing structured tasks, scheduling priorities, and tracking completion logs.', concepts: ['Schema-Constrained Outputs', 'SQLite Storage', 'Tool State'] },
  { num: 5, level: 'Beginner', title: 'Document Q&A RAG Agent', slug: 'ai-agent-05-document-qa-agent', tech: ['Python', 'ChromaDB', 'Sentence-Transformers', 'LangChain'], useCase: 'Retrieval-Augmented Generation agent indexing local PDF/markdown files and answering contextual questions.', concepts: ['Text Chunking', 'Vector Embeddings', 'Cosine Similarity Search'] },
  { num: 6, level: 'Intermediate', title: 'Memory-Enabled Personal AI Agent', slug: 'ai-agent-06-memory-enabled-personal-agent', tech: ['Python', 'PostgreSQL', 'Redis', 'OpenAI'], useCase: 'Conversational agent with short-term buffer memory and long-term semantic retrieval across sessions.', concepts: ['Dual-Tier Memory', 'Vector Retrieval (pgvector)', 'Session Serialization'] },
  { num: 7, level: 'Intermediate', title: 'AI Email Management Agent', slug: 'ai-agent-07-email-management-agent', tech: ['Python', 'Gmail API', 'OAuth2', 'OpenAI'], useCase: 'Email assistant classifying inbound messages, summarizing threads, and drafting contextual responses.', concepts: ['OAuth2 Token Refresh', 'Intent Classification', 'Human Approval Loops'] },
  { num: 8, level: 'Intermediate', title: 'AI Coding Assistant Agent', slug: 'ai-agent-08-coding-assistant-agent', tech: ['Python', 'Tree-Sitter / AST', 'Git', 'OpenAI'], useCase: 'Repository assistant parsing code abstract syntax trees, identifying syntax bugs, and generating unit tests.', concepts: ['AST Parsing', 'Contextual Code Prompting', 'Patch Generation'] },
  { num: 9, level: 'Intermediate', title: 'RAG-Based Knowledge Base Agent', slug: 'ai-agent-09-rag-knowledge-base-agent', tech: ['Python', 'FastAPI', 'Qdrant / ChromaDB', 'Cohere'], useCase: 'Production RAG engine featuring hybrid keyword + dense semantic search and reciprocal rank fusion.', concepts: ['Hybrid Search (BM25 + Dense)', 'Reranking Models', 'Hallucination Mitigation'] },
  { num: 10, level: 'Intermediate', title: 'API Integration Agent', slug: 'ai-agent-10-api-integration-agent', tech: ['Python', 'OpenAPI / Swagger', 'FastAPI', 'Requests'], useCase: 'Dynamic agent reading OpenAPI specs, resolving endpoint dependencies, and executing API calls.', concepts: ['OpenAPI Spec Parsing', 'Dynamic Tool Synthesis', 'Parameter Extraction'] },
  { num: 11, level: 'Advanced', title: 'Autonomous Planning & Execution Agent', slug: 'ai-agent-11-autonomous-planning-execution-agent', tech: ['Python', 'LangGraph', 'Pydantic', 'OpenAI'], useCase: 'Goal-oriented agent generating execution DAGs, verifying intermediate steps, and replanning on failure.', concepts: ['Plan-and-Solve Prompting', 'DAG State Graphs', 'Self-Correction Loops'] },
  { num: 12, level: 'Advanced', title: 'Multi-Agent Research System', slug: 'ai-agent-12-multi-agent-research-system', tech: ['Python', 'LangGraph', 'ChromaDB', 'FastAPI'], useCase: 'Collaborative agent collective: Researcher, Data Analyst, Fact-Checker, and Technical Writer.', concepts: ['Multi-Agent Blackboard Pattern', 'Role Prompting', 'Inter-Agent Consensus'] },
  { num: 13, level: 'Advanced', title: 'Multi-Agent Software Development System', slug: 'ai-agent-13-multi-agent-sdlc-system', tech: ['Python', 'Docker', 'Git', 'LangGraph'], useCase: 'Autonomous software team: Product Owner, Architect, Developer, and QA executing in sandboxes.', concepts: ['Isolated Sandboxing', 'Automated Test Feedback', 'Iterative Code Refinement'] },
  { num: 14, level: 'Advanced', title: 'AI Data Analyst Agent (Text-to-SQL)', slug: 'ai-agent-14-data-analyst-agent', tech: ['Python', 'SQLAlchemy', 'PostgreSQL', 'Matplotlib'], useCase: 'Database query agent converting natural language to validated SQL, checking schema AST, and plotting charts.', concepts: ['SQL AST Guardrails', 'Prompt Injection Prevention', 'Dynamic Data Visualization'] },
  { num: 15, level: 'Advanced', title: 'Agent Evaluation & Testing Platform', slug: 'ai-agent-15-agent-evaluation-testing-platform', tech: ['Python', 'Ragas', 'Pytest', 'Weights & Biases'], useCase: 'Automated benchmarking suite measuring agent tool-selection precision, faithfulness, and latency.', concepts: ['RAG Triad Metrics', 'Deterministic Test Fixtures', 'LLM-as-a-Judge'] },
  { num: 16, level: 'Professional', title: 'DevOps AI Operations Agent (AIOps)', slug: 'ai-agent-16-devops-aiops-agent', tech: ['Python', 'Kubernetes API', 'Prometheus', 'Slack API'], useCase: 'Operational SRE agent diagnosing pod crashloops, parsing logs, and drafting remediation actions.', concepts: ['Incident Correlation', 'Root Cause Analysis', 'Human-in-the-Loop Approval'] },
  { num: 17, level: 'Professional', title: 'AI Customer Support Multi-Agent Platform', slug: 'ai-agent-17-customer-support-multi-agent-platform', tech: ['Python', 'FastAPI', 'PostgreSQL', 'Redis', 'WebSockets'], useCase: 'Enterprise support platform with sentiment analysis, knowledge retrieval, and seamless human escalation.', concepts: ['Real-Time Ticket Routing', 'Sentiment Analysis', 'Agent-to-Human Handover'] },
  { num: 18, level: 'Professional', title: 'AI Business Operations Agent Platform', slug: 'ai-agent-18-business-ops-agent-platform', tech: ['Python', 'FastAPI', 'LangGraph', 'PostgreSQL'], useCase: 'Cross-functional enterprise orchestrator handling procurement approvals, compliance checks, and ERP sync.', concepts: ['Enterprise RBAC', 'Immutable Audit Trails', 'Human Policy Gates'] },
  { num: 19, level: 'Professional', title: 'Autonomous Software Engineering Platform', slug: 'ai-agent-19-autonomous-swe-platform', tech: ['Python', 'Docker SDK', 'GitHub API', 'OpenAI'], useCase: 'Autonomous issue resolver checking out repo branches, running pytest, fixing bugs, and submitting PRs.', concepts: ['SWE-Bench Methodology', 'Git Branch Manipulation', 'Automated Verification'] },
  { num: 20, level: 'Professional', title: 'Enterprise Agentic AI Platform', slug: 'ai-agent-20-enterprise-agentic-platform', tech: ['Python', 'Kubernetes', 'Helm', 'OpenTelemetry', 'FastAPI'], useCase: 'High-availability multi-tenant agent gateway running on Kubernetes with rate limits and OpenTelemetry traces.', concepts: ['Distributed Rate Limiting', 'OpenTelemetry Agent Tracing', 'Multi-Tenant Isolation'] }
];

async function seedAll() {
  console.log('[SEED] Connecting to MongoDB Atlas...');
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('[SEED] Connected.');

  const db = mongoose.connection.db;
  const projectCol = db.collection('projects');
  const domainCol = db.collection('domains');
  const skillCol = db.collection('skills');

  // 1. Fetch domain mappings
  const domains = await domainCol.find({}).toArray();
  const domainMap = {};
  domains.forEach(d => { domainMap[d.slug] = d._id; domainMap[d.name] = d._id; });

  const swId = domainMap['software-engineering'] || domainMap['Software Engineering'];
  const autoId = domainMap['automation-integrations'] || domainMap['Automation & Integrations'];
  const aiId = domainMap['artificial-intelligence'] || domainMap['Artificial Intelligence'];
  const cloudId = domainMap['cloud-infrastructure'] || domainMap['Cloud & Infrastructure'];

  // 2. Ensure Level Repositories exist as parents
  const levelReposToEnsure = [
    // Backend
    { title: 'Backend Beginner Projects (Level 1)', slug: 'backend-beginner-projects', ecosystem: 'Backend Engineering Ecosystem', domainId: swId, domain: 'Software Engineering', level: 'Beginner', repoType: 'level_repo', githubUrl: 'https://github.com/EmaanHumayun/backend-beginner-projects' },
    { title: 'Backend Intermediate Projects (Level 2)', slug: 'backend-intermediate-projects', ecosystem: 'Backend Engineering Ecosystem', domainId: swId, domain: 'Software Engineering', level: 'Intermediate', repoType: 'level_repo', githubUrl: 'https://github.com/EmaanHumayun/backend-intermediate-projects' },
    { title: 'Backend Advanced Projects (Level 3)', slug: 'backend-advanced-projects', ecosystem: 'Backend Engineering Ecosystem', domainId: swId, domain: 'Software Engineering', level: 'Advanced', repoType: 'level_repo', githubUrl: 'https://github.com/EmaanHumayun/backend-advanced-projects' },
    { title: 'Backend Professional Projects (Level 4)', slug: 'backend-professional-projects', ecosystem: 'Backend Engineering Ecosystem', domainId: swId, domain: 'Software Engineering', level: 'Professional', repoType: 'level_repo', githubUrl: 'https://github.com/EmaanHumayun/backend-professional-projects' },

    // Automation
    { title: 'Automation Beginner Projects (Level 1)', slug: 'automation-beginner-projects', ecosystem: 'Automation & Integration Engineering Ecosystem', domainId: autoId, domain: 'Automation & Integrations', level: 'Beginner', repoType: 'level_repo', githubUrl: 'https://github.com/EmaanHumayun/automation-beginner-projects' },
    { title: 'Automation Intermediate Projects (Level 2)', slug: 'automation-intermediate-projects', ecosystem: 'Automation & Integration Engineering Ecosystem', domainId: autoId, domain: 'Automation & Integrations', level: 'Intermediate', repoType: 'level_repo', githubUrl: 'https://github.com/EmaanHumayun/automation-intermediate-projects' },
    { title: 'Automation Advanced Projects (Level 3)', slug: 'automation-advanced-projects', ecosystem: 'Automation & Integration Engineering Ecosystem', domainId: autoId, domain: 'Automation & Integrations', level: 'Advanced', repoType: 'level_repo', githubUrl: 'https://github.com/EmaanHumayun/automation-advanced-projects' },
    { title: 'Automation Professional Projects (Level 4)', slug: 'automation-professional-projects', ecosystem: 'Automation & Integration Engineering Ecosystem', domainId: autoId, domain: 'Automation & Integrations', level: 'Professional', repoType: 'level_repo', githubUrl: 'https://github.com/EmaanHumayun/automation-professional-projects' },

    // AI Agents
    { title: 'AI Agents Beginner Projects (Level 1)', slug: 'ai-agents-beginner-projects', ecosystem: 'AI Agent Engineering & Agentic Systems', domainId: aiId, domain: 'Artificial Intelligence', level: 'Beginner', repoType: 'level_repo', githubUrl: 'https://github.com/EmaanHumayun/ai-agents-beginner-projects' },
    { title: 'AI Agents Intermediate Projects (Level 2)', slug: 'ai-agents-intermediate-projects', ecosystem: 'AI Agent Engineering & Agentic Systems', domainId: aiId, domain: 'Artificial Intelligence', level: 'Intermediate', repoType: 'level_repo', githubUrl: 'https://github.com/EmaanHumayun/ai-agents-intermediate-projects' },
    { title: 'AI Agents Advanced Projects (Level 3)', slug: 'ai-agents-advanced-projects', ecosystem: 'AI Agent Engineering & Agentic Systems', domainId: aiId, domain: 'Artificial Intelligence', level: 'Advanced', repoType: 'level_repo', githubUrl: 'https://github.com/EmaanHumayun/ai-agents-advanced-projects' },
    { title: 'AI Agents Professional Projects (Level 4)', slug: 'ai-agents-professional-projects', ecosystem: 'AI Agent Engineering & Agentic Systems', domainId: aiId, domain: 'Artificial Intelligence', level: 'Professional', repoType: 'level_repo', githubUrl: 'https://github.com/EmaanHumayun/ai-agents-professional-projects' }
  ];

  const parentIdMap = {};

  for (const lr of levelReposToEnsure) {
    const existing = await projectCol.findOne({ slug: lr.slug });
    if (existing) {
      await projectCol.updateOne(
        { _id: existing._id },
        {
          $set: {
            ecosystem: lr.ecosystem,
            domainId: lr.domainId,
            domain: lr.domain,
            level: lr.level,
            repoType: lr.repoType,
            githubUrl: lr.githubUrl,
            githubVerified: true,
            type: 'folder'
          }
        }
      );
      parentIdMap[lr.slug] = existing._id;
    } else {
      const ins = await projectCol.insertOne({
        ...lr,
        type: 'folder',
        status: 'In progress',
        progress: 25,
        visibility: 'public',
        published: true,
        isArchived: false,
        tasks: [],
        createdAt: new Date(),
        updatedAt: new Date()
      });
      parentIdMap[lr.slug] = ins.insertedId;
    }
  }

  console.log('[SEED] Ensured Level Repositories.');

  // 3. Helper to seed subprojects
  async function seedCatalog(items, ecosystemName, domainId, domainName, levelRepoPrefix) {
    console.log(`[SEED] Seeding 20 projects for ${ecosystemName}...`);
    for (const item of items) {
      let levelRepoSlug = '';
      if (item.num <= 5) levelRepoSlug = `${levelRepoPrefix}-beginner-projects`;
      else if (item.num <= 10) levelRepoSlug = `${levelRepoPrefix}-intermediate-projects`;
      else if (item.num <= 15) levelRepoSlug = `${levelRepoPrefix}-advanced-projects`;
      else levelRepoSlug = `${levelRepoPrefix}-professional-projects`;

      const parentId = parentIdMap[levelRepoSlug] || null;

      const numStr = String(item.num).padStart(2, '0');
      const folderName = `${numStr}-${item.slug.replace(/^[a-z-]+-\d+-/, '')}`;
      const localPath = `d:/my personal-workspace/github-ecosystem/${levelRepoSlug}/${folderName}`;
      const githubUrl = `https://github.com/EmaanHumayun/${levelRepoSlug}/tree/main/${folderName}`;

      const status = item.completed ? 'Completed' : (item.num === 2 ? 'Ready to Start' : 'Planned');
      const progress = item.progress || (item.completed ? 100 : 0);

      const tasks = [
        { id: 't1', title: 'Architecture & Design Specification', completed: item.completed || false, weight: 1 },
        { id: 't2', title: 'Core Implementation inside src/', completed: item.completed || false, weight: 3 },
        { id: 't3', title: 'Automated Tests & Assertions inside tests/', completed: item.completed || false, weight: 2 },
        { id: 't4', title: 'Technical Documentation & Reproduction Runbook', completed: item.completed || false, weight: 1 }
      ];

      const updateData = {
        title: `Project ${numStr}: ${item.title}`,
        slug: item.slug,
        projectNumber: item.num,
        ecosystem: ecosystemName,
        domainId,
        domain: domainName,
        level: item.level,
        parentId,
        summary: item.useCase,
        description: `${item.useCase} Covers core principles: ${item.concepts.join(', ')}.`,
        realWorldUseCase: item.useCase,
        relatedConcepts: item.concepts,
        technologies: item.tech,
        githubUrl,
        localPath,
        githubVerified: true,
        repoType: 'project_submodule',
        type: 'project',
        order: item.num,
        status,
        progress,
        tasks,
        portfolioStatus: item.completed ? 'public_portfolio' : 'workspace_only',
        visibility: 'public',
        published: true,
        isArchived: false,
        updatedAt: new Date()
      };

      await projectCol.updateOne(
        { slug: item.slug },
        {
          $set: updateData,
          $setOnInsert: { createdAt: new Date() }
        },
        { upsert: true }
      );
    }
  }

  // Seed Backend, Automation, and AI Agents
  await seedCatalog(BACKEND_PROJECTS, 'Backend Engineering Ecosystem', swId, 'Software Engineering', 'backend');
  await seedCatalog(AUTOMATION_PROJECTS, 'Automation & Integration Engineering Ecosystem', autoId, 'Automation & Integrations', 'automation');
  await seedCatalog(AI_AGENT_PROJECTS, 'AI Agent Engineering & Agentic Systems', aiId, 'Artificial Intelligence', 'ai-agents');

  // 4. Seed Key Skills
  console.log('[SEED] Seeding Essential Skills Matrix...');
  const skillsToSeed = [
    // Backend Skills
    { name: 'REST API Engineering', category: 'Backend Engineering', domainId: swId, level: 'Advanced', status: 'Demonstrated', proficiency: 90, desc: 'Stateless HTTP APIs, URI taxonomy, idempotent methods, status codes, and JSON error contracts.' },
    { name: 'Database Architecture & SQL', category: 'Backend Engineering', domainId: swId, level: 'Advanced', status: 'Demonstrated', proficiency: 85, desc: 'Relational data modeling, schema migrations, composite indexing, and transaction isolation.' },
    { name: 'Authentication & Authorization (JWT/RBAC)', category: 'Backend Engineering', domainId: swId, level: 'Advanced', status: 'Demonstrated', proficiency: 88, desc: 'Stateless JWT tokens, refresh rotation, password hashing, and role-based middleware guards.' },
    { name: 'Distributed Caching (Redis)', category: 'Backend Engineering', domainId: swId, level: 'Intermediate', status: 'Applied in Project', proficiency: 80, desc: 'Cache-aside patterns, TTL expiration, cache stampede prevention, and Pub/Sub.' },
    { name: 'Event-Driven Systems & Queues', category: 'Backend Engineering', domainId: swId, level: 'Intermediate', status: 'Learning', proficiency: 70, desc: 'Asynchronous workers, dead-letter queues, message brokers (RabbitMQ/Kafka), and Outbox pattern.' },

    // Automation Skills
    { name: 'Workflow Automation & Scripting', category: 'Automation & Integrations', domainId: autoId, level: 'Advanced', status: 'Demonstrated', proficiency: 85, desc: 'Python and Node.js operational daemons, file watchers, cron automation, and batch processing.' },
    { name: 'Webhook Architecture & Idempotency', category: 'Automation & Integrations', domainId: autoId, level: 'Advanced', status: 'Demonstrated', proficiency: 85, desc: 'Event listeners, cryptographic signature validation (HMAC), retry backoff, and idempotency keys.' },
    { name: 'API Integrations & OAuth2', category: 'Automation & Integrations', domainId: autoId, level: 'Intermediate', status: 'Applied in Project', proficiency: 80, desc: 'Third-party API synchronization, OAuth token exchange, rate limiters, and payload transformers.' },
    { name: 'Data Pipeline & ETL Engineering', category: 'Automation & Integrations', domainId: autoId, level: 'Intermediate', status: 'Learning', proficiency: 70, desc: 'Extract-Transform-Load pipelines, schema validation, batch ingestion, and stream processing.' },

    // AI Agent Skills
    { name: 'Function Calling & Tool Execution', category: 'AI Agent Engineering', domainId: aiId, level: 'Intermediate', status: 'Demonstrated', proficiency: 80, desc: 'Structured Pydantic schema generation, LLM function calling, and secure local tool execution loops.' },
    { name: 'Retrieval-Augmented Generation (RAG)', category: 'AI Agent Engineering', domainId: aiId, level: 'Intermediate', status: 'Applied in Project', proficiency: 75, desc: 'Vector embeddings, chunking strategies, cosine similarity retrieval, and dense semantic search.' },
    { name: 'Agent Memory & Context Management', category: 'AI Agent Engineering', domainId: aiId, level: 'Intermediate', status: 'Learning', proficiency: 70, desc: 'Dual-tier memory: short-term sliding conversation buffer and long-term vector/SQL episodic storage.' },
    { name: 'Multi-Agent Orchestration (LangGraph)', category: 'AI Agent Engineering', domainId: aiId, level: 'Intermediate', status: 'Learning', proficiency: 65, desc: 'State-machine DAG planning, inter-agent consensus, shared blackboard patterns, and human-in-the-loop.' },

    // DevOps Skills
    { name: 'Linux System Administration & Bash', category: 'DevOps & Cloud', domainId: cloudId, level: 'Advanced', status: 'Demonstrated', proficiency: 90, desc: 'Process management, POSIX permissions, systemd units, network reachability, and shell daemons.' },
    { name: 'Docker Containerization', category: 'DevOps & Cloud', domainId: cloudId, level: 'Advanced', status: 'Demonstrated', proficiency: 90, desc: 'Multi-stage builds, layer caching, distroless images, non-root execution, and compose networks.' },
    { name: 'Kubernetes Workload Orchestration', category: 'DevOps & Cloud', domainId: cloudId, level: 'Intermediate', status: 'Demonstrated', proficiency: 80, desc: 'Deployments, ClusterIP/NodePort Services, ConfigMaps, Secrets, health probes, and Helm charts.' },
    { name: 'Infrastructure as Code (Terraform)', category: 'DevOps & Cloud', domainId: cloudId, level: 'Intermediate', status: 'Demonstrated', proficiency: 82, desc: 'Modular Terraform/OpenTofu configurations for AWS multi-AZ VPCs, subnets, and remote state locks.' },
    { name: 'CI/CD Release Engineering', category: 'DevOps & Cloud', domainId: cloudId, level: 'Advanced', status: 'Demonstrated', proficiency: 88, desc: 'Automated GitHub Actions workflows, test execution matrix, vulnerability scans, and release tagging.' }
  ];

  for (const s of skillsToSeed) {
    await skillCol.updateOne(
      { name: s.name },
      {
        $set: {
          name: s.name,
          category: s.category,
          primaryDomain: s.domainId,
          level: s.level,
          status: s.status,
          proficiencyPercentage: s.proficiency,
          description: s.desc,
          visibility: 'public',
          isArchived: false,
          updatedAt: new Date()
        },
        $setOnInsert: {
          slug: s.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, ''),
          createdAt: new Date()
        }
      },
      { upsert: true }
    );
  }

  console.log('[SEED] Skills seeded successfully.');

  const totalCount = await projectCol.countDocuments({ isArchived: false });
  console.log(`\n======================================================`);
  console.log(`   TOTAL ACTIVE PROJECTS & REPOSITORIES: ${totalCount}`);
  console.log(`======================================================\n`);

  await mongoose.disconnect();
}

seedAll().catch(err => {
  console.error('[FATAL SEED ERROR]', err);
  process.exit(1);
});
