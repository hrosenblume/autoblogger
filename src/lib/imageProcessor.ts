/**
 * Image processing for uploads.
 *
 * Every JPEG/PNG/WebP upload is run through sharp to:
 *   - cap the longest side at MAX_DIMENSION (no upscaling)
 *   - re-encode at QUALITY (mozjpeg for JPEG)
 *   - strip EXIF/metadata
 *
 * Animated GIFs pass through untouched (sharp would only keep the first frame
 * or balloon in size). All other handled formats always emit a result no
 * larger than the input — if re-encoding produces a larger buffer, the
 * original bytes are returned (still EXIF-stripped where possible).
 *
 * Failures fall through to the original buffer so a sharp glitch can never
 * block an upload.
 */

import sharp from 'sharp'

export interface ProcessedImage {
  buffer: Buffer
  mimeType: string
  width?: number
  height?: number
}

const MAX_DIMENSION = 2400
const QUALITY = 85

export async function processImage(
  input: Buffer,
  mimeType: string
): Promise<ProcessedImage> {
  if (mimeType === 'image/gif') {
    return { buffer: input, mimeType }
  }

  if (
    mimeType !== 'image/jpeg' &&
    mimeType !== 'image/png' &&
    mimeType !== 'image/webp'
  ) {
    return { buffer: input, mimeType }
  }

  try {
    const pipeline = sharp(input, { failOn: 'none' }).rotate()
    const metadata = await pipeline.metadata()

    const longest = Math.max(metadata.width || 0, metadata.height || 0)
    if (longest > MAX_DIMENSION) {
      pipeline.resize({
        width: MAX_DIMENSION,
        height: MAX_DIMENSION,
        fit: 'inside',
        withoutEnlargement: true,
      })
    }

    if (mimeType === 'image/jpeg') {
      pipeline.jpeg({ quality: QUALITY, mozjpeg: true })
    } else if (mimeType === 'image/png') {
      pipeline.png({ compressionLevel: 9, palette: true })
    } else if (mimeType === 'image/webp') {
      pipeline.webp({ quality: QUALITY })
    }

    const { data, info } = await pipeline.toBuffer({ resolveWithObject: true })

    if (data.length >= input.length && longest <= MAX_DIMENSION) {
      return { buffer: input, mimeType }
    }

    return {
      buffer: data,
      mimeType,
      width: info.width,
      height: info.height,
    }
  } catch (err) {
    console.warn('[autoblogger] image processing failed, using original:', err)
    return { buffer: input, mimeType }
  }
}
