import { createCipheriv, createDecipheriv, createHash, randomBytes } from 'crypto';

const ALGO = 'aes-256-gcm';

function getKey(): Buffer {
  const raw = process.env.CONNECTOR_TOKEN_ENCRYPTION_KEY?.trim() || '';
  if (!raw) {
    throw new Error('CONNECTOR_TOKEN_ENCRYPTION_KEY is missing.');
  }

  return createHash('sha256').update(raw).digest();
}

export function encryptToken(plain: string): string {
  const key = getKey();
  const iv = randomBytes(12);
  const cipher = createCipheriv(ALGO, key, iv);
  const encrypted = Buffer.concat([cipher.update(plain, 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();

  return [iv.toString('base64url'), tag.toString('base64url'), encrypted.toString('base64url')].join('.');
}

export function decryptToken(payload: string): string {
  const [ivPart, tagPart, cipherPart] = payload.split('.');
  if (!ivPart || !tagPart || !cipherPart) {
    throw new Error('Invalid encrypted token payload.');
  }

  const key = getKey();
  const iv = Buffer.from(ivPart, 'base64url');
  const tag = Buffer.from(tagPart, 'base64url');
  const encrypted = Buffer.from(cipherPart, 'base64url');

  const decipher = createDecipheriv(ALGO, key, iv);
  decipher.setAuthTag(tag);

  const plain = Buffer.concat([decipher.update(encrypted), decipher.final()]);
  return plain.toString('utf8');
}
