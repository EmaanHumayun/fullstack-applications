import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import multer from 'multer';
import { createClient } from '@supabase/supabase-js';
import { env } from '../config/env.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadsDir = path.resolve(__dirname, '../../uploads');
const docsUploadsDir = path.resolve(uploadsDir, 'documents');

if (!fs.existsSync(docsUploadsDir)) {
  try {
    fs.mkdirSync(docsUploadsDir, { recursive: true });
  } catch (e) {
    console.error('[documentStorage] Could not create documents uploads dir:', e.message);
  }
}

// Permitted extensions and content-types for Labs & Assignments
export const ALLOWED_DOCUMENT_EXTENSIONS = new Set([
  '.md', '.markdown',
  '.pdf', '.docx', '.txt',
  '.json', '.yaml', '.yml', '.xml', '.log',
  '.sh', '.py', '.js', '.jsx', '.ts', '.tsx', '.html', '.css', '.sql',
  '.zip',
  '.png', '.jpg', '.jpeg', '.webp', '.gif', '.svg'
]);

export const MIME_TYPE_MAP = {
  '.md': 'text/markdown',
  '.markdown': 'text/markdown',
  '.pdf': 'application/pdf',
  '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  '.txt': 'text/plain',
  '.json': 'application/json',
  '.yaml': 'text/yaml',
  '.yml': 'text/yaml',
  '.xml': 'application/xml',
  '.log': 'text/plain',
  '.sh': 'application/x-sh',
  '.py': 'text/x-python',
  '.js': 'application/javascript',
  '.jsx': 'text/javascript',
  '.ts': 'application/typescript',
  '.tsx': 'text/typescript',
  '.html': 'text/html',
  '.css': 'text/css',
  '.sql': 'application/sql',
  '.zip': 'application/zip',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml'
};

export const TEXT_PREVIEWABLE_EXTENSIONS = new Set([
  '.md', '.markdown', '.txt', '.json', '.yaml', '.yml', '.xml', '.log',
  '.sh', '.py', '.js', '.jsx', '.ts', '.tsx', '.html', '.css', '.sql'
]);

function getSupabaseClient() {
  const url = env.SUPABASE_URL;
  const key = env.SUPABASE_SERVICE_ROLE_KEY || env.SUPABASE_ANON_KEY;
  if (url && key) {
    return createClient(url, key, { auth: { persistSession: false } });
  }
  return null;
}

// Multer memory-storage processor for documents & attachments
export const documentUploadMiddleware = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: (parseInt(env.MAX_UPLOAD_MB, 10) || 25) * 1024 * 1024 }, // 25MB default limit
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (ALLOWED_DOCUMENT_EXTENSIONS.has(ext)) {
      cb(null, true);
    } else {
      cb(new Error(`File type "${ext}" is not permitted. Permitted formats: .md, .markdown, .pdf, .docx, .txt, .json, .yaml, .yml, .sh, .py, .js, .jsx, .ts, .tsx, .html, .css, .sql, .xml, .log, .zip, and images.`));
    }
  }
});

/**
 * Uploads an engineering document/attachment to Supabase or local persistent storage.
 */
export async function uploadDocumentToStorage(file, folderPrefix = 'engineering-docs') {
  const ext = path.extname(file.originalname).toLowerCase();
  const safeBaseName = path.basename(file.originalname, ext).replace(/[^a-zA-Z0-9_-]/g, '_');
  const storedFilename = `${Date.now()}_${safeBaseName}${ext}`;
  const resolvedMime = MIME_TYPE_MAP[ext] || file.mimetype || 'application/octet-stream';

  // 1. Supabase Storage
  const supabase = getSupabaseClient();
  if (supabase) {
    const bucket = env.SUPABASE_BUCKET || 'engineering-hub';
    const storagePath = `${folderPrefix}/${storedFilename}`;
    try {
      const { data, error } = await supabase.storage
        .from(bucket)
        .upload(storagePath, file.buffer, {
          contentType: resolvedMime,
          upsert: true
        });
      if (error) throw error;

      const { data: pubData } = supabase.storage.from(bucket).getPublicUrl(storagePath);
      return {
        id: Math.random().toString(36).substring(2, 10),
        originalFilename: file.originalname,
        storedFilename,
        fileExtension: ext,
        mimeType: resolvedMime,
        sizeBytes: file.size,
        fileUrl: pubData.publicUrl,
        storageKey: storagePath,
        provider: 'supabase',
        uploadedAt: new Date()
      };
    } catch (sbErr) {
      console.warn('[documentStorage] Supabase document upload failed, using local disk fallback:', sbErr.message);
    }
  }

  // 2. Local Disk Fallback
  const localFilePath = path.join(docsUploadsDir, storedFilename);
  await fs.promises.writeFile(localFilePath, file.buffer);
  return {
    id: Math.random().toString(36).substring(2, 10),
    originalFilename: file.originalname,
    storedFilename,
    fileExtension: ext,
    mimeType: resolvedMime,
    sizeBytes: file.size,
    fileUrl: `/uploads/documents/${storedFilename}`,
    storageKey: storedFilename,
    provider: 'local',
    uploadedAt: new Date()
  };
}

/**
 * Safely deletes a document from storage.
 */
export async function deleteDocumentFromStorage(storageKey, provider) {
  if (!storageKey) return false;
  try {
    if (provider === 'supabase') {
      const supabase = getSupabaseClient();
      if (supabase) {
        await supabase.storage.from(env.SUPABASE_BUCKET || 'engineering-hub').remove([storageKey]);
        return true;
      }
    } else {
      const localFilePath = path.join(docsUploadsDir, path.basename(storageKey));
      if (fs.existsSync(localFilePath)) {
        await fs.promises.unlink(localFilePath);
        return true;
      }
    }
  } catch (err) {
    console.warn('[documentStorage] Could not delete document:', err.message);
  }
  return false;
}
