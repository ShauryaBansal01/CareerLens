const APIKey = require('../models/APIKey');
const User = require('../models/User');
const AIServiceFactory = require('../services/ai/AIServiceFactory');

// @desc    Get user's API keys (masked)
// @route   GET /api/keys
// @access  Private
exports.getAPIKeys = async (req, res) => {
  try {
    const keys = await APIKey.find({ user: req.user._id });
    const user = await User.findById(req.user._id);
    
    res.status(200).json({
      success: true,
      data: keys.map(k => ({
        id: k._id,
        provider: k.provider,
        maskedKey: k.maskedKey,
        isValid: k.isValid,
        lastUsedAt: k.lastUsedAt
      })),
      defaultProvider: user.defaultAIProvider
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// @desc    Add or update an API key
// @route   POST /api/keys
// @access  Private
exports.saveAPIKey = async (req, res) => {
  try {
    const { provider, key } = req.body;
    
    if (!provider || !key) {
      return res.status(400).json({ success: false, message: 'Provider and key are required' });
    }

    // Validate key structure before saving (basic validation via the factory health check)
    try {
      const aiProvider = AIServiceFactory.getProvider(provider, key);
      await aiProvider.checkHealth();
    } catch (err) {
      return res.status(400).json({ success: false, message: `Invalid API key for provider ${provider}. Validation failed.` });
    }

    // Upsert key
    let apiKeyRecord = await APIKey.findOne({ user: req.user._id, provider });
    
    if (apiKeyRecord) {
      apiKeyRecord.key = key; // setter will encrypt and mask it
      apiKeyRecord.isValid = true;
      await apiKeyRecord.save();
    } else {
      apiKeyRecord = await APIKey.create({
        user: req.user._id,
        provider,
        key, // setter encrypts
        isValid: true
      });
    }

    // Also update default provider if this is their first key
    const user = await User.findById(req.user._id);
    if (!user.defaultAIProvider || user.defaultAIProvider !== provider) {
      user.defaultAIProvider = provider;
      await user.save();
    }

    res.status(200).json({
      success: true,
      message: 'API Key saved successfully',
      data: {
        id: apiKeyRecord._id,
        provider: apiKeyRecord.provider,
        maskedKey: apiKeyRecord.maskedKey
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// @desc    Delete an API key
// @route   DELETE /api/keys/:id
// @access  Private
exports.deleteAPIKey = async (req, res) => {
  try {
    const apiKey = await APIKey.findOne({ _id: req.params.id, user: req.user._id });
    
    if (!apiKey) {
      return res.status(404).json({ success: false, message: 'API Key not found' });
    }

    await APIKey.deleteOne({ _id: apiKey._id });

    res.status(200).json({ success: true, message: 'API Key deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};
