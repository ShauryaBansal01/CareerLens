const mongoose = require('mongoose');
const crypto = require('crypto');

const OTP_LENGTH = 6;
const MAX_ATTEMPTS = 5;

const otpSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    lowercase: true,
    trim: true,
    index: true,
  },
  // HMAC of the code, never the code itself — a DB dump must not hand out OTPs.
  otpHash: {
    type: String,
    required: true,
  },
  attempts: {
    type: Number,
    default: 0,
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 300, // Document automatically deletes after 5 minutes
  },
});

/**
 * Generates a cryptographically random 6-digit code.
 * The small keyspace is safe because verification is attempt-limited
 * (MAX_ATTEMPTS) and the document expires after 5 minutes.
 */
otpSchema.statics.generateCode = function () {
  return crypto.randomInt(0, 10 ** OTP_LENGTH).toString().padStart(OTP_LENGTH, '0');
};

otpSchema.statics.hashCode = function (code) {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET environment variable is not set');
  }
  return crypto.createHmac('sha256', secret).update(String(code)).digest('hex');
};

/**
 * Issues a fresh code for an email, invalidating any outstanding codes so a
 * resend can't be used to farm extra attempts against an older code.
 * @returns {Promise<string>} the plaintext code — send it, never store it
 */
otpSchema.statics.issue = async function (email) {
  await this.deleteMany({ email });
  const code = this.generateCode();
  await this.create({ email, otpHash: this.hashCode(code) });
  return code;
};

/**
 * Verifies and consumes a code. Returns true only on an exact match, which
 * also deletes the record so a code can never be replayed.
 */
otpSchema.statics.verifyAndConsume = async function (email, code) {
  if (!email || !code) return false;

  const record = await this.findOne({ email: String(email).toLowerCase().trim() }).sort({ createdAt: -1 });
  if (!record) return false;

  // Too many wrong guesses — burn the code rather than allow more tries.
  if (record.attempts >= MAX_ATTEMPTS) {
    await this.deleteOne({ _id: record._id });
    return false;
  }

  const candidate = this.hashCode(code);
  const expected = record.otpHash || '';

  const matches =
    candidate.length === expected.length &&
    crypto.timingSafeEqual(Buffer.from(candidate), Buffer.from(expected));

  if (!matches) {
    await this.updateOne({ _id: record._id }, { $inc: { attempts: 1 } });
    return false;
  }

  await this.deleteOne({ _id: record._id });
  return true;
};

otpSchema.statics.OTP_LENGTH = OTP_LENGTH;
otpSchema.statics.MAX_ATTEMPTS = MAX_ATTEMPTS;

module.exports = mongoose.model('OTP', otpSchema);
