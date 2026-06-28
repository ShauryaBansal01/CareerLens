const mongoose = require('mongoose');
const { encrypt, decrypt } = require('../utils/encryption');

const apiKeySchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  provider: {
    type: String,
    enum: ['gemini', 'openai', 'anthropic'],
    required: true
  },
  key: {
    type: String,
    required: true,
    select: false // Never return the actual key directly
  },
  lastUsedAt: {
    type: Date
  },
  isValid: {
    type: Boolean,
    default: true
  },
  maskedKey: {
    type: String
  }
}, { timestamps: true });

// Ensure one key per provider per user
apiKeySchema.index({ user: 1, provider: 1 }, { unique: true });

// Encrypt the key before saving
apiKeySchema.pre('save', async function () {
  if (this.isModified('key')) {
    // Generate masked key (e.g., sk-...1234)
    const rawKey = this.key;
    if (rawKey.length > 8) {
      this.maskedKey = `${rawKey.substring(0, 4)}...${rawKey.substring(rawKey.length - 4)}`;
    } else {
      this.maskedKey = '****';
    }
    
    // Encrypt the key
    this.key = encrypt(rawKey);
  }
});

// Instance method to get decrypted key
apiKeySchema.methods.getDecryptedKey = function () {
  return decrypt(this.key);
};

module.exports = mongoose.model('APIKey', apiKeySchema);
