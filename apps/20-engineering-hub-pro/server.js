import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import multer from 'multer';

import { env } from './server/config/env.js';
import { connectDB, getDBState } from './server/config/db.js';
import { cookieParserMiddleware } from './server/middleware/auth.js';

// Route imports
import authRoutes from './server/routes/authRoutes.js';
import superAdminRoutes from './server/routes/superAdminRoutes.js';
import projectRoutes from './server/routes/projectRoutes.js';
import folderRoutes from './server/routes/folderRoutes.js';
import skillRoutes from './server/routes/skillRoutes.js';
import roadmapRoutes from './server/routes/roadmapRoutes.js';
import workLogRoutes from './server/routes/workLogRoutes.js';
import milestoneRoutes from './server/routes/milestoneRoutes.js';
import goalRoutes from './server/routes/goalRoutes.js';
import noteRoutes from './server/routes/noteRoutes.js';
import certificateRoutes from './server/routes/certificateRoutes.js';
import profileRoutes from './server/routes/profileRoutes.js';
import themeRoutes from './server/routes/themeRoutes.js';
import settingsRoutes from './server/routes/settingsRoutes.js';
import uploadRoutes from './server/routes/uploadRoutes.js';
import analyticsRoutes from './server/routes/analyticsRoutes.js';
import archiveRoutes from './server/routes/archiveRoutes.js';
import domainRoutes from './server/routes/domainRoutes.js';
import siteContentRoutes from './server/routes/siteContentRoutes.js';
import socialLinkRoutes from './server/routes/socialLinkRoutes.js';
import resourceRoutes from './server/routes/resourceRoutes.js';
import practiceLabRoutes from './server/routes/practiceLabRoutes.js';
import assignmentRoutes from './server/routes/assignmentRoutes.js';
import ecosystemRoutes from './server/routes/ecosystemRoutes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.set('trust proxy', 1);
app.use(express.json({ limit: '10mb' }));

// CORS Policy
app.use(cors({
  origin: (origin, callback) => {
    const allowed = (env.CLIENT_ORIGIN || 'http://localhost:5173,http://localhost:3000')
      .split(',')
      .map(s => s.trim());

    if (!origin || allowed.includes(origin) || allowed.includes('*') || env.NODE_ENV !== 'production') {
      callback(null, true);
    } else {
      callback(null, true); // Dev & preview permissive
    }
  },
  credentials: true
}));

// Cookie Parser Middleware
app.use(cookieParserMiddleware);

// Local Static Uploads Directory Fallback
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  try {
    fs.mkdirSync(uploadsDir, { recursive: true });
  } catch (e) {
    console.error('[server] Could not create uploads dir:', e.message);
  }
}
app.use('/uploads', express.static(uploadsDir));

// Health Check Endpoint
app.get('/api/health', (req, res) => {
  const db = getDBState();
  res.json({
    ok: true,
    service: 'engineering-hub-pro-api',
    status: 'operational',
    dbState: db.state,
    isInMemoryDb: db.isInMemory,
    environment: env.NODE_ENV,
    storage: env.SUPABASE_URL ? 'supabase' : (env.CLOUDINARY_CLOUD_NAME ? 'cloudinary' : 'local-disk'),
    time: new Date().toISOString()
  });
});

// Mount Routes
app.use('/api/auth', authRoutes);
app.use('/api/super-admin', superAdminRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/folders', folderRoutes);
app.use('/api/skills', skillRoutes);
app.use('/api/roadmaps', roadmapRoutes);
app.use('/api/work-logs', workLogRoutes);
app.use('/api/milestones', milestoneRoutes);
app.use('/api/goals', goalRoutes);
app.use('/api/notes', noteRoutes);
app.use('/api/certificates', certificateRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/themes', themeRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/archive', archiveRoutes);
app.use('/api/domains', domainRoutes);
app.use('/api/site-content', siteContentRoutes);
app.use('/api/social-links', socialLinkRoutes);
app.use('/api/resources', resourceRoutes);
app.use('/api/practice-labs', practiceLabRoutes);
app.use('/api/assignments', assignmentRoutes);
app.use('/api/ecosystems', ecosystemRoutes);

// Backwards Compatibility Aliases
app.put('/api/projects-reorder', (req, res, next) => {
  req.url = '/reorder/tree';
  projectRoutes(req, res, next);
});

// Global Error Handler
app.use((err, req, res, next) => {
  if (err.code === 11000) {
    return res.status(409).json({ message: 'A record with this unique identifier or slug already exists.' });
  }
  if (err.name === 'ValidationError') {
    return res.status(400).json({ message: err.message });
  }
  if (err instanceof multer.MulterError) {
    return res.status(400).json({ message: err.message });
  }
  console.error('[server-error]', err);
  res.status(500).json({
    message: env.NODE_ENV === 'production' ? 'An internal server error occurred.' : err.message
  });
});

// Standalone Server Starter
if (
  env.NODE_ENV !== 'production' &&
  process.argv[1] &&
  new URL(`file://${process.argv[1].replace(/\\/g, '/')}`).pathname.endsWith('/server.js')
) {
  const port = Number(env.PORT || 3000);
  connectDB().then(() => {
    app.listen(port, () => console.log(`[SERVER] Engineering Hub Pro API listening on http://localhost:${port}`));
  }).catch(err => {
    console.error('Fatal database startup failure:', err);
    process.exit(1);
  });
}

export default app;
