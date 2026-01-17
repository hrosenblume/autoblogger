/**
 * Built-in storage module for autoblogger.
 * Auto-detects cloud storage (S3-compatible) or falls back to local filesystem.
 * 
 * Supported providers:
 * - DigitalOcean Spaces (set SPACES_KEY, SPACES_SECRET)
 * - AWS S3 (set AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, AWS_S3_BUCKET)
 * - Local filesystem (no config needed, saves to public/uploads)
 */

import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { randomUUID } from 'crypto'

export interface UploadResult {
  url: string
  key: string
}

export interface StorageConfig {
  // S3-compatible storage (DigitalOcean Spaces, AWS S3, etc.)
  s3?: {
    accessKeyId: string
    secretAccessKey: string
    bucket: string
    region?: string
    endpoint?: string
    cdnEndpoint?: string
  }
  // Local storage config
  local?: {
    uploadDir?: string // defaults to 'public/uploads'
    urlPrefix?: string // defaults to '/uploads'
  }
}

// Lazy-loaded S3 client
let s3ClientPromise: Promise<any> | null = null

async function getS3Client(config: NonNullable<StorageConfig['s3']>) {
  if (!s3ClientPromise) {
    s3ClientPromise = (async () => {
      // Dynamic import to avoid requiring @aws-sdk/client-s3 if not using S3
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const { S3Client } = await (Function('return import("@aws-sdk/client-s3")')() as Promise<any>)
      return new S3Client({
        region: config.region || 'us-east-1',
        endpoint: config.endpoint,
        credentials: {
          accessKeyId: config.accessKeyId,
          secretAccessKey: config.secretAccessKey,
        },
      })
    })()
  }
  return s3ClientPromise
}

/**
 * Upload to S3-compatible storage
 */
async function uploadToS3(
  buffer: Buffer,
  filename: string,
  contentType: string,
  config: NonNullable<StorageConfig['s3']>
): Promise<UploadResult> {
  // Dynamic import to avoid requiring @aws-sdk/client-s3 if not using S3
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { PutObjectCommand } = await (Function('return import("@aws-sdk/client-s3")')() as Promise<any>)
  const client = await getS3Client(config)
  
  const ext = filename.split('.').pop()?.toLowerCase() || 'jpg'
  const key = `uploads/${randomUUID()}.${ext}`

  await client.send(
    new PutObjectCommand({
      Bucket: config.bucket,
      Key: key,
      Body: buffer,
      ContentType: contentType,
      ACL: 'public-read',
    })
  )

  const cdnEndpoint = config.cdnEndpoint || config.endpoint || `https://${config.bucket}.s3.${config.region || 'us-east-1'}.amazonaws.com`
  const url = cdnEndpoint.endsWith('/') ? `${cdnEndpoint}${key}` : `${cdnEndpoint}/${key}`

  return { url, key }
}

/**
 * Upload to local filesystem
 */
async function uploadToLocal(
  buffer: Buffer,
  filename: string,
  config?: StorageConfig['local']
): Promise<UploadResult> {
  const ext = filename.split('.').pop()?.toLowerCase() || 'jpg'
  const key = `${randomUUID()}.${ext}`
  const uploadDir = config?.uploadDir || join(process.cwd(), 'public', 'uploads')
  const urlPrefix = config?.urlPrefix || '/uploads'
  
  await mkdir(uploadDir, { recursive: true })
  await writeFile(join(uploadDir, key), buffer)

  return { url: `${urlPrefix}/${key}`, key }
}

/**
 * Detect storage configuration from environment variables
 */
export function detectStorageConfig(): StorageConfig {
  // DigitalOcean Spaces
  if (process.env.SPACES_KEY && process.env.SPACES_SECRET) {
    return {
      s3: {
        accessKeyId: process.env.SPACES_KEY,
        secretAccessKey: process.env.SPACES_SECRET,
        bucket: process.env.SPACES_BUCKET || 'uploads',
        region: process.env.SPACES_REGION || 'sfo3',
        endpoint: process.env.SPACES_ENDPOINT || `https://${process.env.SPACES_REGION || 'sfo3'}.digitaloceanspaces.com`,
        cdnEndpoint: process.env.SPACES_CDN_ENDPOINT,
      },
    }
  }

  // AWS S3
  if (process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY && process.env.AWS_S3_BUCKET) {
    return {
      s3: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
        bucket: process.env.AWS_S3_BUCKET,
        region: process.env.AWS_REGION || 'us-east-1',
        cdnEndpoint: process.env.AWS_S3_CDN_ENDPOINT,
      },
    }
  }

  // Default to local storage
  return { local: {} }
}

/**
 * Upload a file using auto-detected or provided storage config
 */
export async function uploadFile(
  buffer: Buffer,
  filename: string,
  contentType: string,
  config?: StorageConfig
): Promise<UploadResult> {
  const resolvedConfig = config || detectStorageConfig()

  if (resolvedConfig.s3) {
    return uploadToS3(buffer, filename, contentType, resolvedConfig.s3)
  }

  return uploadToLocal(buffer, filename, resolvedConfig.local)
}

/**
 * Create a storage upload handler for autoblogger config.
 * Auto-detects cloud storage from env vars, falls back to local.
 * 
 * Usage:
 * ```ts
 * import { createStorageHandler } from 'autoblogger'
 * 
 * const cms = createAutoblogger({
 *   // ... other config
 *   storage: {
 *     upload: createStorageHandler()
 *   }
 * })
 * ```
 */
export function createStorageHandler(config?: StorageConfig) {
  return async (file: File): Promise<{ url: string }> => {
    const buffer = Buffer.from(await file.arrayBuffer())
    const result = await uploadFile(buffer, file.name, file.type, config)
    return { url: result.url }
  }
}
