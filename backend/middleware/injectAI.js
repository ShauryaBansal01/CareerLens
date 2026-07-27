const APIKey = require('../models/APIKey');
const AIServiceFactory = require('../services/ai/AIServiceFactory');

/**
 * Middleware to inject the appropriate AI service instance into req.ai
 * It checks the user's keys, falls back to system default if none exists.
 */
const injectAI = async (req, res, next) => {
  try {
    // If not authenticated, we can't fetch user keys. Fallback to system default.
    if (!req.user) {
      req.ai = AIServiceFactory.getSystemDefaultProvider();
      return next();
    }

    // 1. Determine which provider to use. The header is caller-controlled, so
    //    validate it against the enum rather than letting an unknown value
    //    throw its way into the 500 handler.
    const requested = req.headers['x-ai-provider'];
    if (requested && !AIServiceFactory.isSupported(requested)) {
      return res.status(400).json({
        success: false,
        message: `Unsupported AI provider '${requested}'. Must be one of: ${AIServiceFactory.SUPPORTED_PROVIDERS.join(', ')}`,
      });
    }

    const targetProvider = requested || req.user.defaultAIProvider || 'gemini';

    // 2. Fetch the user's key for this provider
    const userKeyRecord = await APIKey.findOne({ user: req.user._id, provider: targetProvider });

    if (userKeyRecord && userKeyRecord.isValid) {
      try {
        const decryptedKey = userKeyRecord.getDecryptedKey();
        req.ai = AIServiceFactory.getProvider(targetProvider, decryptedKey);
        req.ai.userId = req.user._id;

        // Update last used asynchronously. updateOne avoids a full document
        // save, which would run unrelated validators on every AI request.
        APIKey.updateOne({ _id: userKeyRecord._id }, { lastUsedAt: new Date() })
          .catch(err => console.error('Failed to update key lastUsedAt:', err.message));

        return next();
      } catch (err) {
        console.error('Failed to instantiate user AI provider:', err.message);
        // Fallback to system below if decryption or instantiation fails
      }
    }

    // 3. Fallback to System Default Provider
    try {
      req.ai = AIServiceFactory.getSystemDefaultProvider();
      req.ai.userId = req.user._id;
      return next();
    } catch {
      return res.status(503).json({
        success: false,
        message: 'No active AI API Key found. Please add an API Key in settings.'
      });
    }
  } catch (error) {
    console.error('injectAI Middleware Error:', error);
    return res.status(500).json({ success: false, message: 'Internal Server Error initializing AI.' });
  }
};

module.exports = injectAI;
