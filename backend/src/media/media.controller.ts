import { Controller, Post, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBody, ApiConsumes, ApiTags } from '@nestjs/swagger';
import { randomUUID } from 'node:crypto';
import { mkdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import sharp from 'sharp';
import { fail } from '../common/domain';

export function storageDirectory() {
  return resolve(process.env.STORAGE_DIR || 'storage/uploads');
}

@ApiTags('Images')
@Controller('media')
export class MediaController {
  @Post('images')
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: { type: 'object', properties: { file: { type: 'string', format: 'binary' } } },
  })
  @UseInterceptors(
    FileInterceptor('file', { limits: { fileSize: 5 * 1024 * 1024, files: 1, fields: 0 } }),
  )
  async upload(@UploadedFile() file?: Express.Multer.File) {
    if (!file) {
      fail('Pilih gambar JPEG, PNG, atau WebP, maksimal 5 MB.');
    }
    let buffer: Buffer;
    try {
      const image = sharp(file.buffer, { limitInputPixels: 25000000, animated: false });
      const metadata = await image.metadata();
      if (!['jpeg', 'png', 'webp'].includes(metadata.format || '')) {
        fail('Format gambar harus JPEG, PNG, atau WebP.');
      }
      buffer = await image
        .rotate()
        .resize(1600, 1600, { fit: 'inside', withoutEnlargement: true })
        .webp({ quality: 85 })
        .toBuffer();
    } catch {
      fail('Gambar tidak valid. Gunakan JPEG, PNG, atau WebP maksimal 25 megapiksel.');
    }
    const name = `${randomUUID()}.webp`;
    await mkdir(storageDirectory(), { recursive: true });
    await writeFile(resolve(storageDirectory(), name), buffer!, { flag: 'wx' });
    return { url: `/uploads/${name}`, size: buffer!.length, mimeType: 'image/webp' };
  }
}
