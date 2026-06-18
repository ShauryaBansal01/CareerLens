const APIKey = require('../models/APIKey');
const User = require('../models/User');
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

    // 1. Determine which provider to use
    // We check if the request explicitly asks for a provider in headers, otherwise use user's default
    let targetProvider = req.headers['x-ai-provider'];
    
    if (!targetProvider) {
      const user = await User.findById(req.user._id);
      targetProvider = user.defaultAIProvider || 'gemini';
    }

    // 2. Fetch the user's key for this provider
    const userKeyRecord = await APIKey.findOne({ user: req.user._id, provider: targetProvider });

    if (userKeyRecord && userKeyRecord.isValid) {
      try {
        const decryptedKey = userKeyRecord.getDecryptedKey();
        req.ai = AIServiceFactory.getProvider(targetProvider, decryptedKey);
        
        // Update last used asynchronously
        userKeyRecord.lastUsedAt = new Date();
        userKeyRecord.save().catch(err => console.error("Failed to update key lastUsedAt:", err));
        
        return next();
      } catch (err) {
        console.error("Failed to instantiate user AI provider:", err);
        // Fallback to system below if decryption or instantiation fails
      }
    }

    // 3. Fallback to System Default Provider
    try {
      req.ai = AIServiceFactory.getSystemDefaultProvider();
      next();
    } catch (sysErr) {
      return res.status(503).json({
        success: false,
        message: 'No active AI API Key found. Please add an API Key in settings.'
      });
    }

  } catch (error) {
    console.error("injectAI Middleware Error:", error);
    res.status(500).json({ success: false, message: 'Internal Server Error initializing AI.' });
  }
};

module.exports = injectAI;
