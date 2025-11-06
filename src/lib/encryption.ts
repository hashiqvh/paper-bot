import crypto from "crypto";

// Encryption key - in production, use environment variable
// AES-256 requires exactly 32 bytes (64 hex characters)
const getEncryptionKey = (): Buffer => {
  if (process.env.ENCRYPTION_KEY) {
    const key = process.env.ENCRYPTION_KEY;
    // If it's a hex string (64 chars), convert it
    if (key.length === 64 && /^[0-9a-fA-F]+$/.test(key)) {
      return Buffer.from(key, 'hex');
    }
    // Otherwise, hash it to get 32 bytes
    return crypto.createHash('sha256').update(key).digest();
  }
  // For development: use a fixed key (NOT SECURE FOR PRODUCTION!)
  // In production, always set ENCRYPTION_KEY environment variable
  // This ensures the key is consistent across server restarts
  return crypto.createHash('sha256').update('peper-bot-erp-dev-key').digest();
};

const ENCRYPTION_KEY_BUFFER = getEncryptionKey();
const ALGORITHM = 'aes-256-cbc';

export function encrypt(text: string): string {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(ALGORITHM, ENCRYPTION_KEY_BUFFER, iv);
  let encrypted = cipher.update(text, 'utf8');
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  return iv.toString('hex') + ':' + encrypted.toString('hex');
}

export function decrypt(text: string): string {
  const textParts = text.split(':');
  const iv = Buffer.from(textParts.shift()!, 'hex');
  const encryptedText = Buffer.from(textParts.join(':'), 'hex');
  const decipher = crypto.createDecipheriv(ALGORITHM, ENCRYPTION_KEY_BUFFER, iv);
  let decrypted = decipher.update(encryptedText);
  decrypted = Buffer.concat([decrypted, decipher.final()]);
  return decrypted.toString('utf8');
}

