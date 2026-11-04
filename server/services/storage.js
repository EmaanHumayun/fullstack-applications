import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import { createClient } from '@supabase/supabase-js';
import { env } from '../config/env.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadsDir = path.resolve(__dirname, '../../uploads');

if (!fs.existsSync(uploadsDir)) {
  try {
    fs.mkdirSync(uploadsDir, { recursive: true });
  } catch (e) {
    console.error('[storage] Could not create local uploads dir:', e.message);
  }
}

// Multer in-memory upload processor
export const uploadMiddleware = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: (parseInt(env.MAX_UPLOAD_MB, 10) || 10) * 1024 * 1024 }, // dynamic limit
  fileFilter: (req, file, cb) => {
    const isImage = /^image\/(png|jpeg|jpg|webp|gif|svg\+xml)$/i.test(file.mimetype);
    const isPdf = file.mimetype === 'application/pdf';
    if (isImage || isPdf) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only PNG, JPG, WEBP, GIF, SVG, and PDF files are permitted.'));
    }
  }
});

function getSupabaseClient() {
  const url = env.SUPABASE_URL;
  const key = env.SUPABASE_SERVICE_ROLE_KEY || env.SUPABASE_ANON_KEY;
  if (url && key) {
    return createClient(url, key, { auth: { persistSession: false } });
  }
  return null;
}

if (env.CLOUDINARY_CLOUD_NAME && env.CLOUDINARY_API_KEY && env.CLOUDINARY_API_SECRET) {
  cloudinary.config({
    cloud_name: env.CLOUDINARY_CLOUD_NAME,
    api_key: env.CLOUDINARY_API_KEY,
    api_secret: env.CLOUDINARY_API_SECRET,
    secure: true
  });
}

/**
 * Uploads a validated file to the configured storage backend (Supabase -> Cloudinary -> Local Disk).
 */
export async function uploadFileToStorage(file) {
  const ext = path.extname(file.originalname) || (file.mimetype.includes('pdf') ? '.pdf' : '.jpg');
  const safeBaseName = path.basename(file.originalname, ext).replace(/[^a-zA-Z0-9_-]/g, '_');
  const fileName = `${Date.now()}_${safeBaseName}${ext}`;

  // 1. Supabase Storage
  const supabase = getSupabaseClient();
  if (supabase) {
    const bucket = env.SUPABASE_BUCKET || 'engineering-hub';
    try {
      const { data, error } = await supabase.storage
        .from(bucket)
        .upload(fileName, file.buffer, {
          contentType: file.mimetype,
          upsert: true
        });
      if (error) throw error;

      const { data: pubData } = supabase.storage.from(bucket).getPublicUrl(fileName);
      return {
        url: pubData.publicUrl,
        storageKey: fileName,
        provider: 'supabase',
        filename: file.originalname,
        mimetype: file.mimetype,
        size: file.size
      };
    } catch (sbErr) {
      console.warn('[storage] Supabase upload failed, falling back to alternatives:', sbErr.message);
    }
  }

  // 2. Cloudinary for images
  if (env.CLOUDINARY_CLOUD_NAME && file.mimetype.startsWith('image/')) {
    try {
      const res = await new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { folder: 'engineering-hub', resource_type: 'image' },
          (err, data) => (err ? reject(err) : resolve(data))
        );
        stream.end(file.buffer);
      });
      return {
        url: res.secure_url,
        storageKey: res.public_id,
        provider: 'cloudinary',
        filename: file.originalname,
        mimetype: file.mimetype,
        size: file.size
      };
    } catch (clErr) {
      console.warn('[storage] Cloudinary upload failed, falling back to local disk:', clErr.message);
    }
  }

  // 3. Local Persistent Disk Fallback
  const localFilePath = path.join(uploadsDir, fileName);
  await fs.promises.writeFile(localFilePath, file.buffer);
  return {
    url: `/uploads/${fileName}`,
    storageKey: fileName,
    provider: 'local',
    filename: file.originalname,
    mimetype: file.mimetype,
    size: file.size
  };
}

/**
 * Safely removes a file from storage.
 */
export async function deleteFileFromStorage(storageKey, provider) {
  if (!storageKey) return false;
  try {
    if (provider === 'supabase') {
      const supabase = getSupabaseClient();
      if (supabase) {
        await supabase.storage.from(env.SUPABASE_BUCKET || 'engineering-hub').remove([storageKey]);
        return true;
      }
    } else if (provider === 'cloudinary') {
      await cloudinary.uploader.destroy(storageKey);
      return true;
    } else {
      const localFilePath = path.join(uploadsDir, path.basename(storageKey));
      if (fs.existsSync(localFilePath)) {
        await fs.promises.unlink(localFilePath);
        return true;
      }
    }
  } catch (err) {
    console.warn('[storage] Could not delete file:', err.message);
  }
  return false;
}
