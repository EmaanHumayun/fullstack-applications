import 'dotenv/config';
import { z } from 'zod';

const envSchema = z.object({
  PORT: z.string().default('3000'),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  MONGODB_URI: z.string().optional(),
  JWT_SECRET: z.string().default('engineering-hub-pro-super-secure-jwt-secret-key-32-chars'),
  JWT_EXPIRES_IN: z.string().default('8h'),
  ADMIN_EMAIL: z.string().email().optional(),
  ADMIN_PASSWORD_HASH: z.string().optional(),
  SUPER_ADMIN_BOOTSTRAP_TOKEN: z.string().optional(),
  CLIENT_ORIGIN: z.string().default('http://localhost:5173,http://localhost:3000'),
  SUPABASE_URL: z.string().optional(),
  SUPABASE_ANON_KEY: z.string().optional(),
  SUPABASE_SERVICE_ROLE_KEY: z.string().optional(),
  SUPABASE_BUCKET: z.string().default('engineering-hub'),
  MAX_UPLOAD_MB: z.string().default('10'),
  CLOUDINARY_CLOUD_NAME: z.string().optional(),
  CLOUDINARY_API_KEY: z.string().optional(),
  CLOUDINARY_API_SECRET: z.string().optional()
});

const parsed = envSchema.safeParse(process.env);
if (!parsed.success) {
  console.error('[env] Invalid environment configuration:', parsed.error.format());
}

export const env = parsed.success ? parsed.data : process.env;

/**
 * Returns safe environment health diagnostics without disclosing credentials.
 */
export function getEnvDiagnostics() {
  return {
    nodeEnv: env.NODE_ENV,
    port: env.PORT,
    hasMongoUri: !!(env.MONGODB_URI && !env.MONGODB_URI.includes('example.mongodb.net')),
    hasJwtSecret: !!env.JWT_SECRET && env.JWT_SECRET.length >= 32,
    hasAdminEmail: !!env.ADMIN_EMAIL,
    hasAdminPasswordHash: !!env.ADMIN_PASSWORD_HASH,
    hasBootstrapToken: !!env.SUPER_ADMIN_BOOTSTRAP_TOKEN,
    hasSupabase: !!(env.SUPABASE_URL && (env.SUPABASE_SERVICE_ROLE_KEY || env.SUPABASE_ANON_KEY)),
    supabaseBucket: env.SUPABASE_BUCKET,
    hasCloudinary: !!(env.CLOUDINARY_CLOUD_NAME && env.CLOUDINARY_API_KEY && env.CLOUDINARY_API_SECRET),
    clientOrigins: (env.CLIENT_ORIGIN || '').split(',').map(s => s.trim())
  };
}
