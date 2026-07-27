const { z } = require('zod');

const validate = (schema) => (req, res, next) => {
  try {
    // Assign the parsed result back: zod strips unknown keys, so downstream
    // handlers can't be fed fields the schema never allowed.
    req.body = schema.parse(req.body);
    next();
  } catch (err) {
    if (err instanceof z.ZodError) {
      const issues = err.issues || err.errors || [];
      const messages = issues.map(e => e.message);
      return res.status(400).json({ message: messages.join('; ') });
    }
    next(err);
  }
};

// Must stay in sync with OTP.generateCode() in models/OTP.js
const otpCode = z.string().regex(/^\d{6}$/, 'OTP must be 6 digits');

const schemas = {
  login: z.object({
    email: z.string().email('Valid email is required'),
    password: z.string().min(1, 'Password is required'),
  }),
  register: z.object({
    name: z.string().min(2, 'Name must be at least 2 characters').max(100),
    email: z.string().email('Valid email is required'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    // `role` is deliberately absent — it is never client-assignable.
    otp: otpCode,
  }),
  sendOtp: z.object({
    email: z.string().email('Valid email is required'),
  }),
  resetPassword: z.object({
    email: z.string().email('Valid email is required'),
    otp: otpCode,
    password: z.string().min(8, 'Password must be at least 8 characters'),
  }),
  refreshToken: z.object({
    refreshToken: z.string().min(1, 'Refresh token is required'),
    refreshFamily: z.string().min(1, 'Refresh family is required'),
  }),
  profileUpdate: z.object({
    basics: z.object({
      name: z.string().optional(),
      email: z.string().email().optional(),
      phone: z.string().optional(),
      linkedin: z.string().optional(),
      github: z.string().optional(),
      summary: z.string().optional(),
    }).optional(),
    skills: z.array(z.string()).optional(),
    experience: z.array(z.object({
      company: z.string().optional(),
      role: z.string().optional(),
      duration: z.string().optional(),
      description: z.union([z.string(), z.array(z.string())]).optional(),
    })).optional(),
    education: z.array(z.object({
      institution: z.string().optional(),
      degree: z.string().optional(),
      duration: z.string().optional(),
    })).optional(),
    projects: z.array(z.object({
      name: z.string().optional(),
      techStack: z.array(z.string()).optional(),
      description: z.string().optional(),
    })).optional(),
  }),
  coverLetter: z.object({
    jobDescription: z.string().min(20, 'Job description must be at least 20 characters'),
    tone: z.enum(['Professional', 'Enthusiastic', 'Confident', 'Creative']).optional(),
  }),
  optimizeForCompany: z.object({
    jobDescription: z.string().min(20, 'Job description must be at least 20 characters'),
  }),
  tailorLatexToJob: z.object({
    jobDescription: z.string().min(20, 'Job description must be at least 20 characters'),
  }),
  optimizeResumeFromFeedback: z.object({
    feedback: z.object({
      critical: z.array(z.any()).optional(),
      suggested: z.array(z.any()).optional(),
      good: z.array(z.any()).optional(),
    }).refine(data => data.critical?.length || data.suggested?.length, {
      message: 'Feedback must contain at least critical or suggested items',
    }),
  }),
  rewriteSection: z.object({
    sectionType: z.string().min(1, 'Section type is required'),
    sectionContent: z.string().min(10, 'Section content must be at least 10 characters'),
  }),
};

module.exports = { validate, schemas };
