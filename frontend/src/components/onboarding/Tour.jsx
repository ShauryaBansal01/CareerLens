import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronRight, ChevronLeft, Check } from 'lucide-react';
import { Button } from '../ui/Button';

const STORAGE_KEY = 'cl-tour-completed';

const steps = [
  {
    title: 'Welcome to CareerLens!',
    desc: 'Your AI-powered career optimization platform. Let\'s take a quick tour of the key features.',
    target: null,
  },
  {
    title: 'Upload Resume',
    desc: 'Start by uploading your PDF resume. Our AI extracts skills, experience, and education automatically.',
    target: '[href="/upload"]',
  },
  {
    title: 'AI Resume Analyzer',
    desc: 'Get instant ATS scoring, skill gap analysis, and actionable feedback to optimize your resume.',
    target: '[href="/resume-ai"]',
  },
  {
    title: 'LaTeX Builder',
    desc: 'Create beautifully formatted, ATS-friendly PDFs with our built-in LaTeX editor and versioning.',
    target: '[href="/resume-latex"]',
  },
  {
    title: 'Cover Letter Generator',
    desc: 'Generate tailored cover letters matching your tone and the job description in seconds.',
    target: '[href="/cover-letter"]',
  },
];

export function Tour() {
  const [active, setActive] = useState(false);
  const [step, setStep] = useState(0);

  useEffect(() => {
    const completed = localStorage.getItem(STORAGE_KEY);
    if (!completed) {
      const timer = setTimeout(() => setActive(true), 800);
      return () => clearTimeout(timer);
    }
  }, []);

  const finish = () => {
    setActive(false);
    localStorage.setItem(STORAGE_KEY, 'true');
  };

  const current = steps[step];

  return (
    <AnimatePresence>
      {active && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm"
            onClick={finish}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 w-full max-w-md mx-4"
          >
            <div className="bg-bg-card border border-border-color rounded-2xl shadow-2xl p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex gap-1">
                  {steps.map((_, i) => (
                    <div
                      key={i}
                      className={`h-1.5 rounded-full transition-all ${
                        i === step ? 'w-6 bg-accent-600' : 'w-1.5 bg-slate-300 dark:bg-slate-600'
                      }`}
                    />
                  ))}
                </div>
                <button
                  onClick={finish}
                  className="p-1 rounded-lg text-text-muted hover:text-text-main hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  aria-label="Close tour"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <h3 className="text-lg font-bold text-text-main mb-2">{current.title}</h3>
              <p className="text-sm text-text-muted mb-6">{current.desc}</p>
              <div className="flex items-center justify-between">
                <button
                  onClick={() => setStep((s) => Math.max(0, s - 1))}
                  disabled={step === 0}
                  className="flex items-center gap-1 text-sm text-text-muted hover:text-text-main transition-colors disabled:opacity-30 disabled:cursor-not-allowed px-2 py-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  <ChevronLeft className="w-4 h-4" /> Back
                </button>
                {step < steps.length - 1 ? (
                  <Button onClick={() => setStep((s) => s + 1)} size="sm" className="gap-1">
                    Next <ChevronRight className="w-4 h-4" />
                  </Button>
                ) : (
                  <Button onClick={finish} size="sm" className="gap-1">
                    Get Started <Check className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
