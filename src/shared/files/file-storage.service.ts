import { mkdir, writeFile } from 'fs/promises';
import path from 'path';
import { randomUUID } from 'crypto';
import { env } from '../../config/env';
import { AppError } from '../errors/app-error';
import { ErrorCodes } from '../errors/error-codes';

function sanitizeFileName(fileName: string): string {
  return fileName.replace(/[^a-zA-Z0-9._-]/g, '_');
}

export const fileStorageService = {
  async saveBase64File(params: {
    preRegistrationId: string;
    fileName: string;
    mimeType: string;
    contentBase64: string;
  }): Promise<{ storageKey: string; fileName: string }> {
    const safeFileName = sanitizeFileName(params.fileName);
    const buffer = Buffer.from(params.contentBase64, 'base64');

    if (buffer.length > Number(env.MAX_ATTACHMENT_SIZE_BYTES || 5242880)) {
      throw new AppError({
        statusCode: 400,
        code: ErrorCodes.VALIDATION_ERROR,
        message: 'Attachment exceeds maximum allowed size',
      });
    }

    const folder = path.join(
      env.FASTPAY_SHARED_FILES_ROOT,
      'pre-registrations',
      params.preRegistrationId
    );

    await mkdir(folder, { recursive: true });

    const storedFileName = `${randomUUID()}-${safeFileName}`;
    const fullPath = path.join(folder, storedFileName);

    await writeFile(fullPath, buffer);

    return {
      storageKey: fullPath,
      fileName: safeFileName,
    };
  },
};