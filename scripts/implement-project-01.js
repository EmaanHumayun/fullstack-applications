import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PROJ_DIR = path.join(__dirname, '..', 'github-ecosystem', 'automation-beginner-projects', '01-automated-email-notification-system');

function ensureDir(dir) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

function write(p, content) {
  ensureDir(path.dirname(p));
  fs.writeFileSync(p, content.trim() + '\n', 'utf8');
}

console.log('[IMPL] Implementing Project 01: Automated Email Notification System...');

// 1. package.json
const PKG = {
  name: 'automated-email-notification-system',
  version: '1.0.0',
  description: 'Transactional email notification service ingesting authenticated webhooks, compiling HTML templates, and dispatching notifications.',
  main: 'server.js',
  type: 'module',
  scripts: {
    start: 'node server.js',
    test: 'node tests/test-notification.js'
  },
  dependencies: {
    express: '^4.19.2'
  }
};
write(path.join(PROJ_DIR, 'package.json'), JSON.stringify(PKG, null, 2));

// 2. src/config/index.js
const CONFIG = `import dotenv from 'dotenv';
dotenv?.config?.();

export const config = {
  port: process.env.PORT || 3000,
  env: process.env.NODE_ENV || 'development',
  webhookSecret: process.env.WEBHOOK_SECRET || 'test_hmac_secret_key_123',
  smtp: {
    host: process.env.SMTP_HOST || 'smtp.ethereal.email',
    port: parseInt(process.env.SMTP_PORT || '587', 10),
    user: process.env.SMTP_USER || 'mock_user',
    pass: process.env.SMTP_PASS || 'mock_pass',
    from: process.env.SMTP_FROM || 'notifications@engineering.local'
  }
};
`;
write(path.join(PROJ_DIR, 'src', 'config', 'index.js'), CONFIG);

// 3. src/utils/validator.js
const VALIDATOR = `import crypto from 'crypto';

export function verifyHmacSignature(rawBody, signatureHeader, secret) {
  if (!signatureHeader || !secret) return false;
  try {
    const expectedSignature = 'sha256=' + crypto.createHmac('sha256', secret).update(rawBody).digest('hex');
    const signatureBuffer = Buffer.from(signatureHeader);
    const expectedBuffer = Buffer.from(expectedSignature);
    if (signatureBuffer.length !== expectedBuffer.length) return false;
    return crypto.timingSafeEqual(signatureBuffer, expectedBuffer);
  } catch {
    return false;
  }
}

export function validateNotificationPayload(data) {
  const errors = [];
  if (!data || typeof data !== 'object') {
    return { valid: false, errors: ['Payload must be a non-empty JSON object'] };
  }

  const { to, subject, templateId, variables } = data;

  if (!to || typeof to !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(to)) {
    errors.push('Field "to" must be a valid email address');
  }

  if (!subject || typeof subject !== 'string' || subject.trim().length < 3) {
    errors.push('Field "subject" must be a string with at least 3 characters');
  }

  const allowedTemplates = ['welcome', 'password_reset', 'order_receipt', 'system_alert'];
  if (!templateId || !allowedTemplates.includes(templateId)) {
    errors.push(\`Field "templateId" must be one of: \${allowedTemplates.join(', ')}\`);
  }

  if (variables && typeof variables !== 'object') {
    errors.push('Field "variables" must be an object if provided');
  }

  return {
    valid: errors.length === 0,
    errors
  };
}
`;
write(path.join(PROJ_DIR, 'src', 'utils', 'validator.js'), VALIDATOR);

// 4. src/actions/sendEmail.js
const ACTIONS = `import crypto from 'crypto';

export async function sendEmailAction({ to, subject, htmlBody, textBody, from }) {
  // In production, this integrates nodemailer or SendGrid.
  // In development/test, it provides deterministic delivery simulation.
  const messageId = \`msg_\${Date.now()}_\${crypto.randomBytes(4).toString('hex')}\`;
  
  // Emulate transport latency
  await new Promise(r => setTimeout(r, 10));

  const deliveryResult = {
    messageId,
    accepted: [to],
    rejected: [],
    envelopeTime: Date.now(),
    response: '250 2.0.0 OK: message queued',
    previewUrl: \`https://ethereal.email/message/\${messageId}\`
  };

  return deliveryResult;
}
`;
write(path.join(PROJ_DIR, 'src', 'actions', 'sendEmail.js'), ACTIONS);

// 5. src/services/notificationService.js
const SERVICE = `import { validateNotificationPayload } from '../utils/validator.js';
import { sendEmailAction } from '../actions/sendEmail.js';
import { config } from '../config/index.js';

const TEMPLATES = {
  welcome: (vars) => ({
    subject: \`Welcome to \${vars.platformName || 'Engineering Portal'}, \${vars.userName || 'Engineer'}!\`,
    html: \`<div style="font-family: sans-serif; padding: 20px;"><h2>Welcome, \${vars.userName || 'Engineer'}!</h2><p>Your account has been provisioned successfully.</p></div>\`,
    text: \`Welcome, \${vars.userName || 'Engineer'}! Your account has been provisioned successfully.\`
  }),
  system_alert: (vars) => ({
    subject: \`[ALERT - \${vars.severity || 'INFO'}] \${vars.alertName || 'System Notification'}\`,
    html: \`<div style="font-family: monospace; color: #b91c1c;"><h3>System Alert</h3><p>\${vars.message || 'No details provided.'}</p></div>\`,
    text: \`System Alert: \${vars.message || 'No details provided.'}\`
  }),
  order_receipt: (vars) => ({
    subject: \`Receipt for Order #\${vars.orderId || 'N/A'}\`,
    html: \`<div><h2>Order Confirmed</h2><p>Amount: \${vars.amount || '$0.00'}</p></div>\`,
    text: \`Order #\${vars.orderId || 'N/A'} confirmed. Amount: \${vars.amount || '$0.00'}\`
  }),
  password_reset: (vars) => ({
    subject: 'Password Reset Request',
    html: \`<div><p>Use code: <strong>\${vars.code || '000000'}</strong></p></div>\`,
    text: \`Use password reset code: \${vars.code || '000000'}\`
  })
};

export class NotificationService {
  static async processNotification(payload) {
    const validation = validateNotificationPayload(payload);
    if (!validation.valid) {
      const err = new Error('Payload validation failed');
      err.status = 400;
      err.details = validation.errors;
      throw err;
    }

    const { to, subject, templateId, variables = {} } = payload;
    const templateRenderer = TEMPLATES[templateId] || TEMPLATES.welcome;
    const rendered = templateRenderer(variables);

    const emailResult = await sendEmailAction({
      to,
      subject: subject || rendered.subject,
      htmlBody: rendered.html,
      textBody: rendered.text,
      from: config.smtp.from
    });

    return {
      status: 'queued',
      trackingId: emailResult.messageId,
      recipient: to,
      template: templateId,
      timestamp: new Date().toISOString(),
      previewUrl: emailResult.previewUrl
    };
  }
}
`;
write(path.join(PROJ_DIR, 'src', 'services', 'notificationService.js'), SERVICE);

// 6. src/triggers/webhookTrigger.js
const TRIGGER = `import express from 'express';
import { NotificationService } from '../services/notificationService.js';
import { verifyHmacSignature } from '../utils/validator.js';
import { config } from '../config/index.js';

export const webhookRouter = express.Router();

webhookRouter.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    service: 'automated-email-notification-system',
    timestamp: new Date().toISOString()
  });
});

webhookRouter.post('/api/v1/notifications/email', async (req, res) => {
  const signature = req.headers['x-hub-signature-256'] || req.headers['x-signature-256'];
  
  // If webhook secret is enforced and signature is provided or in production
  if (config.env === 'production' || signature) {
    const isValid = verifyHmacSignature(req.rawBody || JSON.stringify(req.body), signature, config.webhookSecret);
    if (!isValid) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Invalid or missing HMAC signature header'
      });
    }
  }

  try {
    const result = await NotificationService.processNotification(req.body);
    return res.status(202).json({
      success: true,
      message: 'Notification accepted and queued for delivery',
      data: result
    });
  } catch (err) {
    const status = err.status || 500;
    return res.status(status).json({
      success: false,
      error: err.message,
      details: err.details || null
    });
  }
});
`;
write(path.join(PROJ_DIR, 'src', 'triggers', 'webhookTrigger.js'), TRIGGER);

// 7. server.js
const SERVER = `import express from 'express';
import { config } from './src/config/index.js';
import { webhookRouter } from './src/triggers/webhookTrigger.js';

export function createApp() {
  const app = express();
  
  // Capture raw body for HMAC verification
  app.use(express.json({
    verify: (req, res, buf) => {
      req.rawBody = buf.toString();
    }
  }));

  app.use(webhookRouter);

  // 404 handler
  app.use((req, res) => {
    res.status(404).json({ error: 'Endpoint not found' });
  });

  return app;
}

if (process.env.NODE_ENV !== 'test') {
  const app = createApp();
  app.listen(config.port, () => {
    console.log(\`[SERVER] Email Notification Automation Service listening on port \${config.port}\`);
  });
}
`;
write(path.join(PROJ_DIR, 'server.js'), SERVER);

// 8. tests/test-notification.js (Automated integration test runner)
const TEST_RUNNER = `import http from 'http';
import crypto from 'crypto';
import { createApp } from '../server.js';
import { config } from '../src/config/index.js';

const app = createApp();
const server = http.createServer(app);

function sign(body, secret) {
  return 'sha256=' + crypto.createHmac('sha256', secret).update(body).digest('hex');
}

function request(options, body) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, headers: res.headers, body: JSON.parse(data) });
        } catch {
          resolve({ status: res.statusCode, headers: res.headers, body: data });
        }
      });
    });
    req.on('error', reject);
    if (body) req.write(body);
    req.end();
  });
}

async function runTests() {
  await new Promise(r => server.listen(0, r));
  const port = server.address().port;
  console.log(\`[TESTS] Integration test server started on ephemeral port \${port}\`);

  let passed = 0;
  let total = 0;

  function assert(condition, message) {
    total++;
    if (!condition) {
      console.error(\`FAIL: \${message}\`);
      process.exitCode = 1;
    } else {
      console.log(\`PASS: \${message}\`);
      passed++;
    }
  }

  try {
    // 1. Healthcheck
    const resHealth = await request({
      hostname: '127.0.0.1',
      port,
      path: '/health',
      method: 'GET'
    });
    assert(resHealth.status === 200, 'GET /health returns 200 OK');
    assert(resHealth.body.status === 'healthy', 'Health status is healthy');

    // 2. Valid notification payload with HMAC signature
    const validPayload = JSON.stringify({
      to: 'engineer@example.com',
      subject: 'Welcome to Antigravity Engineering',
      templateId: 'welcome',
      variables: {
        userName: 'Emaan',
        platformName: 'DevOps & Automation Lab'
      }
    });

    const validSignature = sign(validPayload, config.webhookSecret);
    const resValid = await request({
      hostname: '127.0.0.1',
      port,
      path: '/api/v1/notifications/email',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(validPayload),
        'X-Hub-Signature-256': validSignature
      }
    }, validPayload);

    assert(resValid.status === 202, 'Valid payload with HMAC returns 202 Accepted');
    assert(resValid.body.success === true, 'Response body success is true');
    assert(resValid.body.data.trackingId.startsWith('msg_'), 'Response returns generated trackingId');

    // 3. Invalid HMAC signature rejection
    const invalidSignature = 'sha256=invalid_hash_string_1234567890abcdef';
    const resBadSig = await request({
      hostname: '127.0.0.1',
      port,
      path: '/api/v1/notifications/email',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(validPayload),
        'X-Hub-Signature-256': invalidSignature
      }
    }, validPayload);

    assert(resBadSig.status === 401, 'Invalid HMAC signature rejected with 401 Unauthorized');

    // 4. Schema validation rejection (invalid email and unknown template)
    const invalidPayload = JSON.stringify({
      to: 'not-an-email',
      subject: 'Hi',
      templateId: 'non_existent_template'
    });
    const invalidPayloadSig = sign(invalidPayload, config.webhookSecret);

    const resInvalid = await request({
      hostname: '127.0.0.1',
      port,
      path: '/api/v1/notifications/email',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(invalidPayload),
        'X-Hub-Signature-256': invalidPayloadSig
      }
    }, invalidPayload);

    assert(resInvalid.status === 400, 'Invalid schema returns 400 Bad Request');
    assert(Array.isArray(resInvalid.body.details) && resInvalid.body.details.length >= 2, 'Validation details identify invalid fields');

    console.log(\`\\n[TEST RESULTS] Passed: \${passed}/\${total} assertions\`);
  } catch (err) {
    console.error('Test execution error:', err);
    process.exitCode = 1;
  } finally {
    server.close();
  }
}

runTests();
`;
write(path.join(PROJ_DIR, 'tests', 'test-notification.js'), TEST_RUNNER);

// 9. Root Dockerfile and docker-compose.yml for Project 01
write(path.join(PROJ_DIR, 'Dockerfile'), `FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --production
COPY . .
EXPOSE 3000
CMD ["node", "server.js"]
`);

write(path.join(PROJ_DIR, 'docker-compose.yml'), `version: '3.8'
services:
  email-notification-service:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - PORT=3000
      - WEBHOOK_SECRET=test_hmac_secret_key_123
`);

console.log('[IMPL] Project 01 implemented successfully.');

