const crypto = require('crypto');

// The encryption key must be 32 bytes (256 bits) for aes-256-gcm
// We fall back to a dummy key ONLY for development, but in production,
// missing ENCRYPTION_KEY should throw an error.
const getEncryptionKey = () => {
  if (process.env.ENCRYPTION_KEY) {
    return Buffer.from(process.env.ENCRYPTION_KEY, 'hex');
  }
  
  if (process.env.NODE_ENV === 'production') {
    throw new Error('ENCRYPTION_KEY environment variable is missing in production');
  }
  
  // Dev fallback 32-byte hex string (64 characters)
  return Buffer.from('0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef', 'hex');
};

const ALGORITHM = 'aes-256-gcm';

/**
 * Encrypts a plaintext string using AES-256-GCM.
 * @param {string} text - The plaintext to encrypt.
 * @returns {string} - The encrypted payload format: iv:authTag:encryptedText
 */
const encrypt = (text) => {
  if (!text) return text;
  
  const key = getEncryptionKey();
  const iv = crypto.randomBytes(12); // 96-bit IV is recommended for GCM
  
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
  
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  
  const authTag = cipher.getAuthTag().toString('hex');
  
  return `${iv.toString('hex')}:${authTag}:${encrypted}`;
};

/**
 * Decrypts an AES-256-GCM encrypted payload.
 * @param {string} encryptedPayload - The payload format: iv:authTag:encryptedText
 * @returns {string} - The decrypted plaintext.
 */
const decrypt = (encryptedPayload) => {
  if (!encryptedPayload) return encryptedPayload;
  
  const parts = encryptedPayload.split(':');
  if (parts.length !== 3) {
    throw new Error('Invalid encrypted payload format. Expected iv:authTag:encryptedText');
  }
  
  const [ivHex, authTagHex, encryptedText] = parts;
  
  const key = getEncryptionKey();
  const iv = Buffer.from(ivHex, 'hex');
  const authTag = Buffer.from(authTagHex, 'hex');
  
  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(authTag);
  
  let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  
  return decrypted;
};

module.exports = { encrypt, decrypt };
