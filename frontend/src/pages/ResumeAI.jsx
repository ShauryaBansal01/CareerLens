import { useState, useContext } from 'react';
import axios from 'axios';
import AuthContext from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  AlertCircle, CheckCircle, AlertTriangle, Sparkles,
  Building2, ChevronDown, ChevronUp, Plus, Minus,
  RefreshCw, Zap, ArrowRight, MapPin, Wand2,
  Check, X, CheckCircle2, XCircle, Save, FileText,
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

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// ── Score ring component ───────────────────────────────────────────────────────
const ScoreRing = ({ score, size = 80 }) => {
  const r = (size - 8) / 2;
  const circ = 2 * Math.PI * r;
  const prog = circ - (score / 100) * circ;
  const color = score >= 75 ? '#10b981' : score >= 50 ? '#f59e0b' : '#ef4444';
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="shrink-0 drop-shadow-[0_0_8px_rgba(16,185,129,0.25)]">
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

// ── Collapsible feedback card (with location + quote) ──────────────────────────
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
    <div className={`rounded-xl border overflow-hidden transition-all duration-300 hover:-translate-y-0.5 hover:shadow-ambient ${c.container}`}>
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
          {item.location && (
            <p className="text-[11px] font-medium text-gray-500 dark:text-gray-400 mt-0.5 flex items-center gap-1">
              <MapPin className="w-3 h-3 shrink-0" />
              {item.location}
            </p>
          )}
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
              {item.quote && item.quote !== '[Section not found]' && (
                <div className="bg-gray-100/60 dark:bg-gray-800/40 rounded-lg px-3.5 py-2 mb-2.5 border-l-[3px] border-l-gray-400 dark:border-l-gray-500">
                  <p className="text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-0.5">
                    From your resume
                  </p>
                  <p className="text-[13px] text-gray-700 dark:text-gray-300 leading-relaxed italic">
                    &ldquo;{item.quote}&rdquo;
                  </p>
                </div>
              )}
              {item.quote === '[Section not found]' && (
                <div className="bg-gray-100/60 dark:bg-gray-800/40 rounded-lg px-3.5 py-2 mb-2.5 border-l-[3px] border-l-gray-400 dark:border-l-gray-500">
                  <p className="text-[12px] text-gray-500 dark:text-gray-400 italic">
                    ⚠ This section is missing from your resume
                  </p>
                </div>
              )}
              <p className={`text-[13px] text-gray-700 dark:text-gray-300 leading-relaxed ${item.example ? 'mb-2.5' : 'mb-0'}`}>
                {item.detail}
              </p>
              {item.example && (
                <div className="bg-blue-50/50 dark:bg-blue-900/10 rounded-lg px-3.5 py-2.5 border-l-[3px] border-l-blue-600">
                  <p className="text-[11px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider mb-1">
                    Example
                  </p>
                  <p className="text-[13px] text-gray-900 dark:text-gray-100 leading-relaxed italic">
                    &ldquo;{item.example}&rdquo;
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
    <div className={`rounded-xl border overflow-hidden transition-all duration-300 hover:shadow-ambient ${c.container}`}>
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
                    <p className="text-[13px] text-gray-900 dark:text-gray-100 leading-relaxed italic">&ldquo;{item.before}&rdquo;</p>
                  </div>
                  <div className="bg-green-50/50 dark:bg-green-900/10 rounded-lg px-3.5 py-2.5 border border-green-500/15 dark:border-green-500/20">
                    <p className="text-[11px] font-bold text-green-600 dark:text-green-500 uppercase tracking-wider mb-1">After</p>
                    <p className="text-[13px] text-gray-900 dark:text-gray-100 leading-relaxed italic">&ldquo;{item.after}&rdquo;</p>
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

// ── Diff Card for accept/reject individual changes ─────────────────────────────
const DiffCard = ({ change, accepted, onToggle }) => {
  return (
    <motion.div
      variants={fadeUp}
      className={`rounded-xl border overflow-hidden transition-all duration-300 ${
        accepted
          ? 'border-emerald-500/30 bg-emerald-50/20 dark:bg-emerald-900/5'
          : 'border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/20 opacity-60'
      }`}
    >
      {/* Header */}
      <div className="px-4 py-3 flex items-center justify-between gap-3 border-b border-gray-100 dark:border-gray-700/50">
        <div className="flex items-center gap-2 min-w-0">
          <div className={`w-2 h-2 rounded-full shrink-0 ${
            change.changeType === 'rewrite' ? 'bg-blue-500' :
            change.changeType === 'enhance' ? 'bg-purple-500' : 'bg-amber-500'
          }`} />
          <span className="text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider truncate">
            {change.field}
          </span>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${
            change.changeType === 'rewrite'
              ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400'
              : change.changeType === 'enhance'
              ? 'bg-purple-500/10 text-purple-600 dark:text-purple-400'
              : 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
          }`}>
            {change.changeType}
          </span>
          <button
            onClick={onToggle}
            className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all duration-200 ${
              accepted
                ? 'bg-emerald-500 text-white shadow-sm shadow-emerald-500/25'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-400 dark:text-gray-500'
            }`}
          >
            {accepted ? <Check className="w-3.5 h-3.5" /> : <X className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Diff content */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-0 md:divide-x divide-gray-100 dark:divide-gray-700/50">
        {/* Original */}
        <div className="px-4 py-3 bg-red-50/30 dark:bg-red-900/5">
          <p className="text-[10px] font-bold text-red-500 dark:text-red-400 uppercase tracking-wider mb-1.5 flex items-center gap-1">
            <Minus className="w-3 h-3" /> Original
          </p>
          <p className="text-[13px] text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">
            {change.original}
          </p>
        </div>
        {/* Optimized */}
        <div className="px-4 py-3 bg-emerald-50/30 dark:bg-emerald-900/5 border-t md:border-t-0 border-gray-100 dark:border-gray-700/50">
          <p className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider mb-1.5 flex items-center gap-1">
            <Plus className="w-3 h-3" /> Optimized
          </p>
          <p className="text-[13px] text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">
            {change.optimized}
          </p>
        </div>
      </div>

      {/* Reason */}
      <div className="px-4 py-2 bg-gray-50/50 dark:bg-gray-800/30 border-t border-gray-100 dark:border-gray-700/50">
        <p className="text-[11px] text-gray-500 dark:text-gray-400 italic flex items-center gap-1.5">
          <Sparkles className="w-3 h-3 text-amber-500 shrink-0" />
          {change.reason}
        </p>
      </div>
    </motion.div>
  );
};

// ── Spinner ────────────────────────────────────────────────────────────────────
const Spinner = ({ label }) => (
  <div className="flex flex-col items-center gap-3.5 py-12">
    <div className="w-11 h-11 rounded-full border-[3px] border-white/10 dark:border-white/5 border-t-blue-600 animate-spin" />
    <p className="text-sm text-gray-500 dark:text-gray-400">{label}</p>
  </div>
);

const cardClass = "rounded-2xl border border-slate-200 bg-white p-6 shadow-[0_18px_50px_rgba(15,23,42,0.06)] dark:border-slate-800 dark:bg-slate-900";
const panelClass = "rounded-xl border border-slate-200 bg-slate-50 p-5 dark:border-slate-800 dark:bg-slate-950/60";
const primaryButtonClass = "inline-flex items-center justify-center gap-2 rounded-xl bg-[#6C5CE7] px-5 py-3 text-sm font-bold text-white shadow-[0_14px_28px_rgba(108,92,231,0.24)] transition hover:bg-[#584bd4] disabled:cursor-not-allowed disabled:opacity-50";

// ── Main Page ──────────────────────────────────────────────────────────────────
const ResumeAI = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  // Improve state
  const [improveFeedback, setImproveFeedback] = useState(null);
  const [improveLoading, setImproveLoading]   = useState(false);
  const [improveError, setImproveError]       = useState('');

  // Optimize state
  const [jobDesc, setJobDesc]               = useState('');
  const [optimizeResult, setOptimizeResult] = useState(null);
  const [optimizeLoading, setOptimizeLoading] = useState(false);
  const [optimizeError, setOptimizeError]   = useState('');

  // Optimize-from-feedback state (Phase 2)
  const [optimizing, setOptimizing] = useState(false);
  const [optimizeData, setOptimizeData] = useState(null);
  const [optimizeFeedbackError, setOptimizeFeedbackError] = useState('');
  const [acceptedChanges, setAcceptedChanges] = useState({});
  const [savingOptimized, setSavingOptimized] = useState(false);
  const [generatingLatex, setGeneratingLatex] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState('');

  const cfg = { headers: { Authorization: `Bearer ${user?.token}` } };

  // ── Handlers ─────────────────────────────────────────────────────────────────
  const handleImprove = async () => {
    setImproveLoading(true);
    setImproveError('');
    setImproveFeedback(null);
    // Reset optimize state when re-analyzing
    setOptimizeData(null);
    setAcceptedChanges({});
    setOptimizeFeedbackError('');
    try {
      const res = await axios.post(`${API_URL}/resume/improve`, {}, cfg);
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
      const res = await axios.post(`${API_URL}/resume/optimize`, { jobDescription: jobDesc }, cfg);
      setOptimizeResult(res.data);
    } catch (err) {
      setOptimizeError(err.response?.data?.message || 'Could not generate optimization. Please try again.');
    } finally {
      setOptimizeLoading(false);
    }
  };

  // ── Optimize from Feedback Handler ───────────────────────────────────────────
  const handleOptimizeFromFeedback = async () => {
    setOptimizing(true);
    setOptimizeFeedbackError('');
    setOptimizeData(null);
    setSaveSuccess('');
    try {
      const res = await axios.post(`${API_URL}/resume/optimize-from-feedback`,
        { feedback: improveFeedback }, cfg);
      setOptimizeData(res.data);
      // Pre-accept all changes
      const accepted = {};
      (res.data.sections || []).forEach(s =>
        (s.changes || []).forEach(c => { accepted[c.id] = true; })
      );
      setAcceptedChanges(accepted);
    } catch (err) {
      setOptimizeFeedbackError(err.response?.data?.message || 'Optimization failed. Please try again.');
    } finally {
      setOptimizing(false);
    }
  };

  const toggleChange = (changeId) => {
    setAcceptedChanges(prev => ({ ...prev, [changeId]: !prev[changeId] }));
  };

  const acceptAll = () => {
    const accepted = {};
    (optimizeData?.sections || []).forEach(s =>
      (s.changes || []).forEach(c => { accepted[c.id] = true; })
    );
    setAcceptedChanges(accepted);
  };

  const rejectAll = () => {
    const rejected = {};
    (optimizeData?.sections || []).forEach(s =>
      (s.changes || []).forEach(c => { rejected[c.id] = false; })
    );
    setAcceptedChanges(rejected);
  };

  const getAcceptedCount = () => Object.values(acceptedChanges).filter(Boolean).length;
  const getTotalCount = () => Object.keys(acceptedChanges).length;

  // ── Save accepted changes to profile ─────────────────────────────────────────
  const handleSaveToProfile = async () => {
    if (!optimizeData?.optimizedProfile) return;
    setSavingOptimized(true);
    setSaveSuccess('');
    try {
      const profile = optimizeData.optimizedProfile;
      await axios.put(`${API_URL}/profile`, {
        basics: profile.basics,
        skills: profile.skills,
        experience: profile.experience,
        education: profile.education,
        projects: profile.projects,
      }, cfg);
      setSaveSuccess('Profile updated with optimized resume content!');
    } catch (err) {
      setOptimizeFeedbackError(err.response?.data?.message || 'Failed to save optimized profile.');
    } finally {
      setSavingOptimized(false);
    }
  };

  // ── Generate LaTeX from optimized content ────────────────────────────────────
  const handleGenerateLatex = async () => {
    if (!optimizeData?.optimizedProfile) return;
    setGeneratingLatex(true);
    try {
      const profile = optimizeData.optimizedProfile;
      const resumeData = {
        personalInfo: {
          name: profile.basics?.name || '',
          email: profile.basics?.email || '',
          phone: profile.basics?.phone || '',
          linkedin: profile.basics?.linkedin || '',
          github: profile.basics?.github || '',
        },
        summary: profile.basics?.summary || '',
        skills: (profile.skills || []).join(', '),
        experience: (profile.experience || []).map(exp => ({
          company: exp.company || '',
          role: exp.role || '',
          dates: exp.duration || '',
          bulletPoints: exp.description || '',
        })),
        education: (profile.education || []).map(edu => ({
          school: edu.institution || '',
          degree: edu.degree || '',
          dates: edu.duration || '',
        })),
        projects: (profile.projects || []).map(proj => ({
          name: proj.name || '',
          techStack: (proj.techStack || []).join(', '),
          description: proj.description || '',
        })),
        enhanceWithAI: false,
      };

      const { data } = await axios.post(`${API_URL}/resume/latex/generate`, { resumeData }, cfg);
      const versionRes = await axios.post(`${API_URL}/resume/versions`, {
        title: 'AI Optimized Resume',
        rawLatexCode: data.rawLatexCode,
        source: 'ai-optimized',
      }, cfg);

      navigate('/resume-latex', { state: { versionId: versionRes.data._id } });
    } catch (err) {
      setOptimizeFeedbackError(err.response?.data?.message || 'Failed to generate LaTeX.');
    } finally {
      setGeneratingLatex(false);
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
          <Link to="/login" className={primaryButtonClass}>Sign In</Link>
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
          <div className={`${cardClass} mb-6`}>

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
                <span className="premium-pill-gray text-[11px]">🔴 Critical fixes</span>
                <span className="premium-pill-gray text-[11px]">🟡 Suggestions</span>
                <span className="premium-pill-gray text-[11px]">🟢 Strengths</span>
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
                <button onClick={handleImprove} className={primaryButtonClass}>
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

                  {/* Score banner + Optimize button */}
                  <motion.div
                    variants={fadeUp}
                    className={`${panelClass} flex items-center gap-5 mb-7`}
                  >
                    <ScoreRing score={improveFeedback.score || 0} size={80} />
                    <div className="flex-1">
                      <p className="text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-1.5">
                        Resume Score
                      </p>
                      <p className="text-lg font-semibold text-gray-900 dark:text-white leading-snug tracking-tight mb-2">
                        {improveFeedback.summary}
                      </p>
                      <div className="flex items-center gap-3 flex-wrap">
                        <button
                          onClick={() => { setImproveFeedback(null); setOptimizeData(null); handleImprove(); }}
                          className="text-xs text-blue-600 dark:text-blue-400 bg-transparent border-none cursor-pointer p-0 flex items-center gap-1 hover:underline"
                        >
                          <RefreshCw className="w-3 h-3" /> Re-analyze
                        </button>
                        <div className="w-px h-3.5 bg-gray-300 dark:bg-gray-600" />
                        <button
                          onClick={handleOptimizeFromFeedback}
                          disabled={optimizing}
                          className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-bold text-white bg-gradient-to-r from-emerald-500 to-teal-500 shadow-sm shadow-emerald-500/20 hover:from-emerald-600 hover:to-teal-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {optimizing ? (
                            <>
                              <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                              Optimizing…
                            </>
                          ) : (
                            <>
                              <Wand2 className="w-3.5 h-3.5" />
                              Optimize Resume
                            </>
                          )}
                        </button>
                      </div>
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
            SECTION 1B — Optimization Results (Diff Viewer)
        ══════════════════════════════════════════════════════════════════════ */}
        <AnimatePresence>
          {optimizing && (
            <motion.div
              key="optimize-loading"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              className={`${cardClass} mb-6`}
            >
              <Spinner label="Applying AI suggestions to your resume… This may take a moment." />
            </motion.div>
          )}

          {optimizeFeedbackError && !optimizing && (
            <motion.div
              key="optimize-error"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              className={`${cardClass} mb-6`}
            >
              <div className="bg-red-50 dark:bg-red-900/10 rounded-xl px-4 py-3.5 flex items-center gap-2.5">
                <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
                <p className="text-sm text-red-600 dark:text-red-400">{optimizeFeedbackError}</p>
              </div>
            </motion.div>
          )}

          {optimizeData && !optimizing && (
            <motion.div
              key="optimize-diff-viewer"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, ease: 'easeOut' }}
              className={`${cardClass} mb-6`}
            >
              {/* Header */}
              <div className="flex items-start justify-between gap-4 mb-6 flex-wrap">
                <div>
                  <div className="flex items-center gap-2.5 mb-1.5">
                    <div className="w-2 h-2 rounded-full bg-emerald-500" />
                    <p className="text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest">
                      Optimization Results
                    </p>
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight mb-1.5">
                    Review Changes
                  </h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400 max-w-[520px]">
                    {optimizeData.summary} — Review each change and accept or reject individual improvements.
                  </p>
                </div>
                {optimizeData.estimatedScoreIncrease > 0 && (
                  <div className="flex items-center gap-2 bg-emerald-50 dark:bg-emerald-900/20 px-3 py-2 rounded-xl border border-emerald-500/20">
                    <ArrowRight className="w-4 h-4 text-emerald-600 dark:text-emerald-400 rotate-[-90deg]" />
                    <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
                      +{optimizeData.estimatedScoreIncrease} pts
                    </span>
                  </div>
                )}
              </div>

              {/* Bulk actions */}
              <div className="flex items-center justify-between mb-5 pb-4 border-b border-gray-100 dark:border-gray-700/50">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  <span className="font-semibold text-gray-900 dark:text-white">{getAcceptedCount()}</span> of{' '}
                  <span className="font-semibold text-gray-900 dark:text-white">{getTotalCount()}</span> changes accepted
                </p>
                <div className="flex items-center gap-2">
                  <button
                    onClick={acceptAll}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-500/20 hover:bg-emerald-100 dark:hover:bg-emerald-900/30 transition-colors"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" /> Accept All
                  </button>
                  <button
                    onClick={rejectAll}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                  >
                    <XCircle className="w-3.5 h-3.5" /> Reject All
                  </button>
                </div>
              </div>

              {/* Section-by-section diffs */}
              <motion.div variants={stagger} initial="hidden" animate="show" className="flex flex-col gap-6">
                {(optimizeData.sections || []).map((section, sIdx) => (
                  <motion.div key={sIdx} variants={fadeUp}>
                    <div className="flex items-center gap-2 mb-3">
                      <div className={`w-1.5 h-4 rounded-full ${
                        section.sectionType === 'experience' ? 'bg-blue-500' :
                        section.sectionType === 'projects' ? 'bg-purple-500' :
                        section.sectionType === 'skills' ? 'bg-amber-500' :
                        section.sectionType === 'education' ? 'bg-teal-500' :
                        'bg-indigo-500'
                      }`} />
                      <h3 className="text-sm font-bold text-gray-900 dark:text-white tracking-tight">
                        {section.sectionName}
                      </h3>
                      <span className="text-[10px] font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wider">
                        {section.changes?.length} change{section.changes?.length !== 1 ? 's' : ''}
                      </span>
                    </div>
                    <div className="flex flex-col gap-2.5">
                      {(section.changes || []).map((change, cIdx) => (
                        <DiffCard
                          key={change.id || `${sIdx}-${cIdx}`}
                          change={change}
                          accepted={!!acceptedChanges[change.id]}
                          onToggle={() => toggleChange(change.id)}
                        />
                      ))}
                    </div>
                  </motion.div>
                ))}
              </motion.div>

              {/* Save success message */}
              {saveSuccess && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-5 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl px-4 py-3 flex items-center gap-2.5 border border-emerald-500/20"
                >
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <p className="text-sm text-emerald-700 dark:text-emerald-400 font-medium">{saveSuccess}</p>
                </motion.div>
              )}

              {/* Action buttons */}
              <div className="mt-6 pt-5 border-t border-gray-100 dark:border-gray-700/50 flex flex-wrap items-center gap-3">
                <button
                  onClick={handleSaveToProfile}
                  disabled={savingOptimized || getAcceptedCount() === 0}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-blue-600 to-indigo-600 shadow-sm shadow-blue-500/20 hover:from-blue-700 hover:to-indigo-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {savingOptimized ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Saving…
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      Save to Profile
                    </>
                  )}
                </button>

                <button
                  onClick={handleGenerateLatex}
                  disabled={generatingLatex || getAcceptedCount() === 0}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-emerald-500 to-teal-500 shadow-sm shadow-emerald-500/20 hover:from-emerald-600 hover:to-teal-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {generatingLatex ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Generating LaTeX…
                    </>
                  ) : (
                    <>
                      <FileText className="w-4 h-4" />
                      Generate Optimized LaTeX
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ══════════════════════════════════════════════════════════════════════
            SECTION 2 — Optimize Resume for Company
        ══════════════════════════════════════════════════════════════════════ */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.1 }}>
          <div className={cardClass}>

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
                placeholder={"Paste the full job description, role requirements, or company overview here…\n\nExample: 'We are looking for a React Developer with experience in TypeScript, Next.js, AWS, and GraphQL. The ideal candidate has 2+ years of frontend experience and has shipped production-grade applications...'"}
                className="block min-h-[220px] w-full resize-y rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm leading-6 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#6C5CE7] focus:ring-4 focus:ring-[#6C5CE7]/10 dark:border-slate-800 dark:bg-slate-950 dark:text-white dark:placeholder:text-slate-500"
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
              className={`${primaryButtonClass} w-full ${optimizeResult || optimizeLoading ? 'mb-8' : 'mb-0'}`}
            >
              {optimizeLoading
                ? <span className="flex items-center justify-center gap-2.5">
                    <span className="premium-spinner border-white/20 border-t-white" />
                    Analyzing &amp; optimizing…
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
                    className="glass-panel flex items-center gap-5 mb-7"
                  >
                    <ScoreRing score={optimizeResult.matchScore || 0} size={80} />
                    <div className="flex-1">
                      <p className="text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-1.5">
                        Current Match Score
                      </p>
                      <p className="text-base font-semibold text-gray-900 dark:text-white leading-snug tracking-tight mb-2.5">
                        {optimizeResult.companySummary}
                      </p>
                      {optimizeResult.keywords?.length > 0 && (
                        <div>
                          <p className="text-[11px] font-semibold text-gray-500 dark:text-gray-400 mb-1.5">Missing ATS keywords:</p>
                          <div className="flex flex-wrap gap-1.5">
                            {optimizeResult.keywords.map((kw, i) => (
                              <span key={i} className="premium-pill-error text-[11px]">{kw}</span>
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
