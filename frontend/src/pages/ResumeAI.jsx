import { useState, useContext } from 'react';
import axios from 'axios';
import AuthContext from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  AlertCircle, CheckCircle, AlertTriangle, Sparkles,
  Building2, ChevronDown, ChevronUp, Plus, Minus,
  RefreshCw, Zap, ArrowRight,
} from 'lucide-react';

// ── Animation variants ─────────────────────────────────────────────────────────
const stagger = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.06 } },
};
const fadeUp = {
  hidden: { opacity: 0, y: 14 },
  show: { opacity: 1, y: 0, transition: { duration: 0.28, ease: 'easeOut' } },
};

// ── Score ring component ───────────────────────────────────────────────────────
const ScoreRing = ({ score, size = 80 }) => {
  const r = (size - 8) / 2;
  const circ = 2 * Math.PI * r;
  const prog = circ - (score / 100) * circ;
  const color = score >= 75 ? '#34c759' : score >= 50 ? '#ff9500' : '#ff3b30';
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="shrink-0">
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="currentColor" strokeWidth={8} className="text-gray-100 dark:text-gray-700" />
      <circle
        cx={size / 2} cy={size / 2} r={r}
        fill="none" stroke={color} strokeWidth={8}
        strokeDasharray={circ} strokeDashoffset={prog}
        strokeLinecap="round"
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
        className="transition-[stroke-dashoffset] duration-700 ease-in-out"
      />
      <text
        x={size / 2} y={size / 2 + 1}
        textAnchor="middle" dominantBaseline="middle"
        className="text-lg font-bold fill-gray-900 dark:fill-white font-sans"
      >
        {score}
      </text>
    </svg>
  );
};

// ── Collapsible feedback card ──────────────────────────────────────────────────
const FeedbackCard = ({ item, type }) => {
  const [open, setOpen] = useState(false);

  const config = {
    critical: {
      container: 'bg-red-50/50 dark:bg-red-900/10 border-red-500/25 border-l-[3px] border-l-red-500',
      iconBg: 'bg-red-500/10 dark:bg-red-500/20',
      icon: <AlertCircle className="w-4 h-4 text-red-500" />,
      label: 'Critical',
      labelColor: 'text-red-500 bg-red-500/10',
    },
    suggested: {
      container: 'bg-orange-50/50 dark:bg-orange-900/10 border-orange-500/25 border-l-[3px] border-l-orange-500',
      iconBg: 'bg-orange-500/10 dark:bg-orange-500/20',
      icon: <AlertTriangle className="w-4 h-4 text-orange-500" />,
      label: 'Suggested',
      labelColor: 'text-orange-500 bg-orange-500/10',
    },
    good: {
      container: 'bg-green-50/50 dark:bg-green-900/10 border-green-500/25 border-l-[3px] border-l-green-500',
      iconBg: 'bg-green-500/10 dark:bg-green-500/20',
      icon: <CheckCircle className="w-4 h-4 text-green-500" />,
      label: 'Good',
      labelColor: 'text-green-500 bg-green-500/10',
    },
  };

  const c = config[type];

  return (
    <div className={`rounded-xl border overflow-hidden transition-shadow duration-200 ${c.container}`}>
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full border-none bg-transparent px-4 py-3.5 flex items-center gap-3 cursor-pointer text-left"
      >
        <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${c.iconBg}`}>
          {c.icon}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 tracking-tight">
            {item.issue}
          </p>
        </div>
        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full shrink-0 ${c.labelColor}`}>
          {c.label}
        </span>
        {open ? (
          <ChevronUp className="w-4 h-4 text-gray-400 shrink-0" />
        ) : (
          <ChevronDown className="w-4 h-4 text-gray-400 shrink-0" />
        )}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            key="improve-content"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 pl-[52px]">
              <p className={`text-[13px] text-gray-700 dark:text-gray-300 leading-relaxed ${item.example ? 'mb-2.5' : 'mb-0'}`}>
                {item.detail}
              </p>
              {item.example && (
                <div className="bg-blue-50/50 dark:bg-blue-900/10 rounded-lg px-3.5 py-2.5 border-l-[3px] border-l-blue-600">
                  <p className="text-[11px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider mb-1">
                    Example
                  </p>
                  <p className="text-[13px] text-gray-900 dark:text-gray-100 leading-relaxed italic">
                    "{item.example}"
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// ── Optimize result card ───────────────────────────────────────────────────────
const OptimizeCard = ({ item, type }) => {
  const [open, setOpen] = useState(false);

  const config = {
    add: {
      container: 'bg-green-50/50 dark:bg-green-900/10 border-green-500/20 border-l-[3px] border-l-green-500',
      iconBg: 'bg-green-500/10 dark:bg-green-500/20',
      icon: <Plus className="w-3.5 h-3.5 text-green-600 dark:text-green-500" />,
    },
    remove: {
      container: 'bg-red-50/50 dark:bg-red-900/10 border-red-500/20 border-l-[3px] border-l-red-500',
      iconBg: 'bg-red-500/10 dark:bg-red-500/20',
      icon: <Minus className="w-3.5 h-3.5 text-red-600 dark:text-red-500" />,
    },
    modify: {
      container: 'bg-blue-50/50 dark:bg-blue-900/10 border-blue-500/20 border-l-[3px] border-l-blue-600',
      iconBg: 'bg-blue-500/10 dark:bg-blue-500/20',
      icon: <RefreshCw className="w-3.5 h-3.5 text-blue-600 dark:text-blue-500" />,
    },
  };

  const c = config[type];

  return (
    <div className={`rounded-xl border overflow-hidden ${c.container}`}>
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full border-none bg-transparent px-4 py-3 flex items-center gap-3 cursor-pointer text-left"
      >
        <div className={`w-6 h-6 rounded-md flex items-center justify-center shrink-0 ${c.iconBg}`}>
          {c.icon}
        </div>
        <p className="flex-1 text-sm font-semibold text-gray-900 dark:text-gray-100 tracking-tight">
          {item.item}
        </p>
        {open ? (
          <ChevronUp className="w-4 h-4 text-gray-400" />
        ) : (
          <ChevronDown className="w-4 h-4 text-gray-400" />
        )}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            key="optimize-content"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-3.5 pl-[52px] flex flex-col gap-2">
              {item.reason && (
                <p className="text-[13px] text-gray-500 dark:text-gray-400 leading-relaxed">{item.reason}</p>
              )}
              {item.howTo && (
                <div className="bg-white dark:bg-dark-card rounded-lg px-3.5 py-2.5 border border-white/10 dark:border-white/5">
                  <p className="text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">
                    How to add
                  </p>
                  <p className="text-[13px] text-gray-900 dark:text-gray-100 leading-relaxed">{item.howTo}</p>
                </div>
              )}
              {item.before && (
                <div className="flex flex-col gap-1.5">
                  <div className="bg-red-50/50 dark:bg-red-900/10 rounded-lg px-3.5 py-2.5 border border-red-500/15 dark:border-red-500/20">
                    <p className="text-[11px] font-bold text-red-500 dark:text-red-400 uppercase tracking-wider mb-1">Before</p>
                    <p className="text-[13px] text-gray-900 dark:text-gray-100 leading-relaxed italic">"{item.before}"</p>
                  </div>
                  <div className="bg-green-50/50 dark:bg-green-900/10 rounded-lg px-3.5 py-2.5 border border-green-500/15 dark:border-green-500/20">
                    <p className="text-[11px] font-bold text-green-600 dark:text-green-500 uppercase tracking-wider mb-1">After</p>
                    <p className="text-[13px] text-gray-900 dark:text-gray-100 leading-relaxed italic">"{item.after}"</p>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// ── Spinner ────────────────────────────────────────────────────────────────────
const Spinner = ({ label }) => (
  <div className="flex flex-col items-center gap-3.5 py-12">
    <div className="w-11 h-11 rounded-full border-[3px] border-white/10 dark:border-white/5 border-t-blue-600 animate-spin" />
    <p className="text-sm text-gray-500 dark:text-gray-400">{label}</p>
  </div>
);

// ── Main Page ──────────────────────────────────────────────────────────────────
const ResumeAI = () => {
  const { user } = useContext(AuthContext);

  // Improve state
  const [improveFeedback, setImproveFeedback] = useState(null);
  const [improveLoading, setImproveLoading]   = useState(false);
  const [improveError, setImproveError]       = useState('');

  // Optimize state
  const [jobDesc, setJobDesc]               = useState('');
  const [optimizeResult, setOptimizeResult] = useState(null);
  const [optimizeLoading, setOptimizeLoading] = useState(false);
  const [optimizeError, setOptimizeError]   = useState('');

  const cfg = { headers: { Authorization: `Bearer ${user?.token}` } };

  // ── Handlers ─────────────────────────────────────────────────────────────────
  const handleImprove = async () => {
    setImproveLoading(true);
    setImproveError('');
    setImproveFeedback(null);
    try {
      const res = await axios.post(`${import.meta.env.VITE_API_URL}/resume/improve`, {}, cfg);
      setImproveFeedback(res.data);
    } catch (err) {
      setImproveError(err.response?.data?.message || 'Could not generate feedback. Please try again.');
    } finally {
      setImproveLoading(false);
    }
  };

  const handleOptimize = async () => {
    if (!jobDesc.trim() || jobDesc.trim().length < 20) {
      setOptimizeError('Please paste a job description (minimum 20 characters).');
      return;
    }
    setOptimizeLoading(true);
    setOptimizeError('');
    setOptimizeResult(null);
    try {
      const res = await axios.post(`${import.meta.env.VITE_API_URL}/resume/optimize`, { jobDescription: jobDesc }, cfg);
      setOptimizeResult(res.data);
    } catch (err) {
      setOptimizeError(err.response?.data?.message || 'Could not generate optimization. Please try again.');
    } finally {
      setOptimizeLoading(false);
    }
  };

  // ── Not logged in ─────────────────────────────────────────────────────────────
  if (!user) {
    return (
      <div className="min-h-[calc(100vh-54px)] flex items-center justify-center bg-gray-50 dark:bg-dark-surface p-6">
        <div className="bg-white dark:bg-dark-card rounded-2xl p-12 px-10 text-center max-w-[400px] shadow-sm">
          <AlertCircle className="w-10 h-10 text-red-500 mx-auto mb-5" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight mb-2">Sign in required</h2>
          <p className="text-gray-500 dark:text-gray-400 text-[15px] mb-7">Sign in and upload your resume to use AI Resume tools.</p>
          <Link to="/login" className="btn-apple px-7 py-3 no-underline inline-block">Sign In</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 dark:bg-dark-surface min-h-[calc(100vh-54px)] px-6 py-14 pb-20">
      <div className="max-w-[900px] mx-auto">

        {/* ── Page header ────────────────────────────────────────────────────── */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="mb-12">
          <div className="flex items-center gap-3.5 mb-2.5">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-indigo-500 via-purple-500 to-indigo-500 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-gray-900 dark:text-white tracking-tight leading-tight">
                Resume AI
              </h1>
              <p className="text-[15px] text-gray-500 dark:text-gray-400 mt-1">
                Get expert-level feedback. Tailor your resume for any role.
              </p>
            </div>
          </div>
        </motion.div>

        {/* ══════════════════════════════════════════════════════════════════════
            SECTION 1 — Improve Your Resume
        ══════════════════════════════════════════════════════════════════════ */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.05 }}>
          <div className="bg-white dark:bg-dark-card rounded-2xl p-9 px-10 mb-6 shadow-sm">

            {/* Header */}
            <div className="flex items-start justify-between gap-4 mb-7 flex-wrap">
              <div>
                <div className="flex items-center gap-2.5 mb-1.5">
                  <div className="w-2 h-2 rounded-full bg-blue-600" />
                  <p className="text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest">
                    Section 1
                  </p>
                </div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight mb-1.5">
                  Improve Your Resume
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 max-w-[480px]">
                  Get a comprehensive AI audit of your resume — covering structure, impact, ATS optimization, and skill gaps.
                </p>
              </div>
              <div className="flex gap-2 items-center">
                <span className="apple-pill-gray text-[11px]">🔴 Critical fixes</span>
                <span className="apple-pill-gray text-[11px]">🟡 Suggestions</span>
                <span className="apple-pill-gray text-[11px]">🟢 Strengths</span>
              </div>
            </div>

            {/* CTA */}
            {!improveFeedback && !improveLoading && (
              <div className="flex flex-col items-center py-8 pb-4">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-gray-50 to-white dark:from-gray-800 dark:to-gray-700 border border-white/10 dark:border-gray-600 flex items-center justify-center mb-4">
                  <Sparkles className="w-7 h-7 text-blue-600 dark:text-blue-400" />
                </div>
                <p className="text-base font-semibold text-gray-900 dark:text-white mb-1.5">Ready to analyze your resume</p>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-6 text-center max-w-[380px]">
                  Our AI will review your resume like a senior recruiter at a top tech company.
                </p>
                <button onClick={handleImprove} className="btn-apple px-8 py-3.5 text-[15px] flex items-center gap-2">
                  Analyze My Resume
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Loading */}
            {improveLoading && <Spinner label="Analyzing your resume with AI…" />}

            {/* Error */}
            {improveError && (
              <div className="bg-red-50 dark:bg-red-900/10 rounded-xl px-4 py-3.5 flex items-center gap-2.5">
                <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
                <p className="text-sm text-red-600 dark:text-red-400">{improveError}</p>
              </div>
            )}

            {/* Results */}
            <AnimatePresence>
              {improveFeedback && (
                <motion.div key="improve-results" variants={stagger} initial="hidden" animate="show">

                  {/* Score banner */}
                  <motion.div
                    variants={fadeUp}
                    className="bg-gradient-to-br from-gray-50 to-white dark:from-gray-800 dark:to-gray-800/50 rounded-2xl p-5 px-6 flex items-center gap-5 mb-7 border border-white/10 dark:border-white/5"
                  >
                    <ScoreRing score={improveFeedback.score || 0} size={80} />
                    <div className="flex-1">
                      <p className="text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-1.5">
                        Resume Score
                      </p>
                      <p className="text-lg font-semibold text-gray-900 dark:text-white leading-snug tracking-tight mb-2">
                        {improveFeedback.summary}
                      </p>
                      <button
                        onClick={() => { setImproveFeedback(null); handleImprove(); }}
                        className="text-xs text-blue-600 dark:text-blue-400 bg-transparent border-none cursor-pointer p-0 flex items-center gap-1 hover:underline"
                      >
                        <RefreshCw className="w-3 h-3" /> Re-analyze
                      </button>
                    </div>
                  </motion.div>

                  {/* Critical */}
                  {improveFeedback.critical?.length > 0 && (
                    <motion.div variants={fadeUp} className="mb-5">
                      <p className="text-xs font-bold text-red-500 uppercase tracking-widest mb-2.5 flex items-center gap-1.5">
                        <AlertCircle className="w-3.5 h-3.5" />
                        Critical — Fix Before Applying ({improveFeedback.critical.length})
                      </p>
                      <div className="flex flex-col gap-2">
                        {improveFeedback.critical.map((item, i) => (
                          <FeedbackCard key={i} item={item} type="critical" />
                        ))}
                      </div>
                    </motion.div>
                  )}

                  {/* Suggested */}
                  {improveFeedback.suggested?.length > 0 && (
                    <motion.div variants={fadeUp} className="mb-5">
                      <p className="text-xs font-bold text-orange-500 uppercase tracking-widest mb-2.5 flex items-center gap-1.5">
                        <AlertTriangle className="w-3.5 h-3.5" />
                        Suggested Improvements ({improveFeedback.suggested.length})
                      </p>
                      <div className="flex flex-col gap-2">
                        {improveFeedback.suggested.map((item, i) => (
                          <FeedbackCard key={i} item={item} type="suggested" />
                        ))}
                      </div>
                    </motion.div>
                  )}

                  {/* Good */}
                  {improveFeedback.good?.length > 0 && (
                    <motion.div variants={fadeUp}>
                      <p className="text-xs font-bold text-green-500 uppercase tracking-widest mb-2.5 flex items-center gap-1.5">
                        <CheckCircle className="w-3.5 h-3.5" />
                        What You're Doing Well ({improveFeedback.good.length})
                      </p>
                      <div className="flex flex-col gap-2">
                        {improveFeedback.good.map((item, i) => (
                          <FeedbackCard key={i} item={item} type="good" />
                        ))}
                      </div>
                    </motion.div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>

        {/* ══════════════════════════════════════════════════════════════════════
            SECTION 2 — Optimize Resume for Company
        ══════════════════════════════════════════════════════════════════════ */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.1 }}>
          <div className="bg-white dark:bg-dark-card rounded-2xl p-9 px-10 shadow-sm">

            {/* Header */}
            <div className="mb-7">
              <div className="flex items-center gap-2.5 mb-1.5">
                <div className="w-2 h-2 rounded-full bg-indigo-500" />
                <p className="text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest">
                  Section 2
                </p>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight mb-1.5">
                Optimize Resume for Company
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 max-w-[520px]">
                Paste a job description or company overview — our AI cross-references it with your resume and gives you a precise tailoring plan.
              </p>
            </div>

            {/* Input area */}
            <div className="mb-4">
              <label className="text-[13px] font-semibold text-gray-900 dark:text-white flex items-center gap-1.5 mb-2">
                <Building2 className="w-3.5 h-3.5 text-indigo-500" />
                Job Description / Company Requirements
              </label>
              <textarea
                value={jobDesc}
                onChange={e => { setJobDesc(e.target.value); setOptimizeError(''); }}
                placeholder="Paste the full job description, role requirements, or company overview here…&#10;&#10;Example: 'We are looking for a React Developer with experience in TypeScript, Next.js, AWS, and GraphQL. The ideal candidate has 2+ years of frontend experience and has shipped production-grade applications...'"
                className="w-full min-h-[180px] bg-gray-50 dark:bg-dark-surface/50 border border-transparent rounded-xl p-4 px-4.5 text-sm text-gray-900 dark:text-gray-100 leading-relaxed resize-y outline-none transition-colors duration-200 focus:border-indigo-500 focus:bg-white dark:focus:bg-dark-card"
              />
              <div className="flex justify-between mt-1.5">
                <p className={`text-xs ${jobDesc.length < 20 ? 'text-red-500' : 'text-gray-400'}`}>
                  {jobDesc.length} characters {jobDesc.length < 20 ? `(need ${20 - jobDesc.length} more)` : ''}
                </p>
                {jobDesc.length > 0 && (
                  <button
                    onClick={() => { setJobDesc(''); setOptimizeResult(null); setOptimizeError(''); }}
                    className="text-xs text-gray-500 dark:text-gray-400 bg-transparent border-none cursor-pointer hover:underline"
                  >
                    Clear
                  </button>
                )}
              </div>
            </div>

            {optimizeError && (
              <div className="bg-red-50 dark:bg-red-900/10 rounded-xl p-3 px-4 flex items-center gap-2.5 mb-4">
                <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
                <p className="text-[13px] text-red-600 dark:text-red-400">{optimizeError}</p>
              </div>
            )}

            <button
              onClick={handleOptimize}
              disabled={optimizeLoading || jobDesc.trim().length < 20}
              className={`btn-apple-rect mb-${optimizeResult || optimizeLoading ? '8' : '0'}`}
            >
              {optimizeLoading
                ? <span className="flex items-center justify-center gap-2.5">
                    <span className="apple-spinner" />
                    Analyzing & optimizing…
                  </span>
                : <>
                    <Zap className="w-4 h-4 mr-2" />
                    Analyze &amp; Optimize
                  </>
              }
            </button>

            {/* Loading */}
            {optimizeLoading && <Spinner label="Cross-referencing your resume with the job description…" />}

            {/* Results */}
            <AnimatePresence>
              {optimizeResult && (
                <motion.div key="optimize-results" variants={stagger} initial="hidden" animate="show">

                  {/* Match score + summary */}
                  <motion.div
                    variants={fadeUp}
                    className="bg-gray-50 dark:bg-dark-card/50 rounded-2xl p-5 px-6 flex items-center gap-5 mb-7 border border-white/10 dark:border-white/5"
                  >
                    <ScoreRing score={optimizeResult.matchScore || 0} size={80} />
                    <div className="flex-1">
                      <p className="text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-1.5">
                        Current Match Score
                      </p>
                      <p className="text-base font-semibold text-gray-900 dark:text-white leading-snug tracking-tight mb-2.5">
                        {optimizeResult.companySummary}
                      </p>
                      {/* ATS Keywords */}
                      {optimizeResult.keywords?.length > 0 && (
                        <div>
                          <p className="text-[11px] font-semibold text-gray-500 dark:text-gray-400 mb-1.5">Missing ATS keywords:</p>
                          <div className="flex flex-wrap gap-1.5">
                            {optimizeResult.keywords.map((kw, i) => (
                              <span key={i} className="apple-pill-error text-[11px]">{kw}</span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </motion.div>

                  {/* ADD */}
                  {optimizeResult.add?.length > 0 && (
                    <motion.div variants={fadeUp} className="mb-5">
                      <p className="text-xs font-bold text-green-500 uppercase tracking-widest mb-2.5 flex items-center gap-1.5">
                        <Plus className="w-3.5 h-3.5" />
                        Add These ({optimizeResult.add.length})
                      </p>
                      <div className="flex flex-col gap-2">
                        {optimizeResult.add.map((item, i) => (
                          <OptimizeCard key={i} item={item} type="add" />
                        ))}
                      </div>
                    </motion.div>
                  )}

                  {/* REMOVE */}
                  {optimizeResult.remove?.length > 0 && (
                    <motion.div variants={fadeUp} className="mb-5">
                      <p className="text-xs font-bold text-red-500 uppercase tracking-widest mb-2.5 flex items-center gap-1.5">
                        <Minus className="w-3.5 h-3.5" />
                        Remove These ({optimizeResult.remove.length})
                      </p>
                      <div className="flex flex-col gap-2">
                        {optimizeResult.remove.map((item, i) => (
                          <OptimizeCard key={i} item={item} type="remove" />
                        ))}
                      </div>
                    </motion.div>
                  )}

                  {/* MODIFY */}
                  {optimizeResult.modify?.length > 0 && (
                    <motion.div variants={fadeUp}>
                      <p className="text-xs font-bold text-blue-500 uppercase tracking-widest mb-2.5 flex items-center gap-1.5">
                        <RefreshCw className="w-3.5 h-3.5" />
                        Modify These ({optimizeResult.modify.length})
                      </p>
                      <div className="flex flex-col gap-2">
                        {optimizeResult.modify.map((item, i) => (
                          <OptimizeCard key={i} item={item} type="modify" />
                        ))}
                      </div>
                    </motion.div>
                  )}

                  {/* Re-run */}
                  <motion.div variants={fadeUp} className="mt-6 pt-5 border-t border-white/10 dark:border-white/5 flex justify-end">
                    <button
                      onClick={() => { setOptimizeResult(null); setJobDesc(''); }}
                      className="text-[13px] text-gray-500 dark:text-gray-400 bg-transparent border-none cursor-pointer flex items-center gap-1.5 hover:underline"
                    >
                      <RefreshCw className="w-3.5 h-3.5" /> Try another job description
                    </button>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>

      </div>
    </div>
  );
};

export default ResumeAI;
