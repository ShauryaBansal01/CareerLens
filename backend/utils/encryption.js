const crypto = require('crypto');

// The encryption key must be 32 bytes (256 bits) for aes-256-gcm.
//
// The fallback below is a constant published in this repository, so anything
// encrypted under it is effectively plaintext. It is therefore allowed only
// where it is explicitly safe.
//
// This check is deliberately an allow-list rather than `NODE_ENV === 'production'`.
// Node does not default NODE_ENV to anything, and Render does not set it: a
// deny-list would treat an unset value as "not production" and silently encrypt
// real users' API keys under the public constant.
const DEV_ENVIRONMENTS = ['development', 'test'];

const DEV_FALLBACK_KEY = '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef';

const getEncryptionKey = () => {
  if (process.env.ENCRYPTION_KEY) {
    const key = Buffer.from(process.env.ENCRYPTION_KEY, 'hex');
    // A short hex string parses without error and yields a short buffer, which
    // createCipheriv then rejects with an opaque message at call time. Fail
    // here instead, where the cause is obvious.
    if (key.length !== 32) {
      throw new Error(
        `ENCRYPTION_KEY must be 32 bytes (64 hex characters); got ${key.length} bytes.`
      );
    }
    return key;
  }

  if (!DEV_ENVIRONMENTS.includes(process.env.NODE_ENV)) {
    throw new Error(
      'ENCRYPTION_KEY is required unless NODE_ENV is "development" or "test". ' +
      'Generate one with: node -e "console.log(require(\'crypto\').randomBytes(32).toString(\'hex\'))"'
    );
  }

  return Buffer.from(DEV_FALLBACK_KEY, 'hex');
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
