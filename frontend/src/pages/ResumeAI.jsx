import { useState, useContext, useEffect } from 'react';
import axios from 'axios';
import AuthContext from '../context/AuthContext';
import TaskContext from '../context/TaskContext';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  AlertCircle, CheckCircle, AlertTriangle, Sparkles,
  Building2, ChevronDown, ChevronUp, Plus, Minus,
  RefreshCw, Zap, ArrowRight, MapPin, Wand2,
  Check, X, CheckCircle2, XCircle, Save, FileText,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';

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
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="currentColor" strokeWidth={8} className="text-slate-200 dark:text-slate-700" />
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
        className="text-lg font-bold fill-text-main font-sans"
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
          <p className="text-sm font-semibold text-text-main tracking-tight">
            {item.issue}
          </p>
          {item.location && (
            <p className="text-[11px] font-medium text-text-muted mt-0.5 flex items-center gap-1">
              <MapPin className="w-3 h-3 shrink-0" />
              {item.location}
            </p>
          )}
        </div>
        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full shrink-0 ${c.labelColor}`}>
          {c.label}
        </span>
        {open ? (
          <ChevronUp className="w-4 h-4 text-slate-400 shrink-0" />
        ) : (
          <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
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
                <div className="bg-slate-100/60 dark:bg-slate-800/40 rounded-lg px-3.5 py-2 mb-2.5 border-l-[3px] border-l-slate-400 dark:border-l-slate-500">
                  <p className="text-[11px] font-bold text-text-muted uppercase tracking-wider mb-0.5">
                    From your resume
                  </p>
                  <p className="text-[13px] text-text-main/80 leading-relaxed italic">
                    &ldquo;{item.quote}&rdquo;
                  </p>
                </div>
              )}
              {item.quote === '[Section not found]' && (
                <div className="bg-slate-100/60 dark:bg-slate-800/40 rounded-lg px-3.5 py-2 mb-2.5 border-l-[3px] border-l-slate-400 dark:border-l-slate-500">
                  <p className="text-[12px] text-text-muted italic">
                    ⚠ This section is missing from your resume
                  </p>
                </div>
              )}
              <p className={`text-[13px] text-text-main/80 leading-relaxed ${item.example ? 'mb-2.5' : 'mb-0'}`}>
                {item.detail}
              </p>
              {item.example && (
                <div className="bg-blue-50/50 dark:bg-blue-900/10 rounded-lg px-3.5 py-2.5 border-l-[3px] border-l-blue-600">
                  <p className="text-[11px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider mb-1">
                    Example
                  </p>
                  <p className="text-[13px] text-text-main leading-relaxed italic">
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
        <p className="flex-1 text-sm font-semibold text-text-main tracking-tight">
          {item.item}
        </p>
        {open ? (
          <ChevronUp className="w-4 h-4 text-slate-400" />
        ) : (
          <ChevronDown className="w-4 h-4 text-slate-400" />
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
                <p className="text-[13px] text-text-muted leading-relaxed">{item.reason}</p>
              )}
              {item.howTo && (
                <div className="bg-bg-card rounded-lg px-3.5 py-2.5 border border-border-color">
                  <p className="text-[11px] font-bold text-text-muted uppercase tracking-wider mb-1">
                    How to add
                  </p>
                  <p className="text-[13px] text-text-main leading-relaxed">{item.howTo}</p>
                </div>
              )}
              {item.before && (
                <div className="flex flex-col gap-1.5">
                  <div className="bg-red-50/50 dark:bg-red-900/10 rounded-lg px-3.5 py-2.5 border border-red-500/15 dark:border-red-500/20">
                    <p className="text-[11px] font-bold text-red-500 dark:text-red-400 uppercase tracking-wider mb-1">Before</p>
                    <p className="text-[13px] text-text-main leading-relaxed italic">&ldquo;{item.before}&rdquo;</p>
                  </div>
                  <div className="bg-green-50/50 dark:bg-green-900/10 rounded-lg px-3.5 py-2.5 border border-green-500/15 dark:border-green-500/20">
                    <p className="text-[11px] font-bold text-green-600 dark:text-green-500 uppercase tracking-wider mb-1">After</p>
                    <p className="text-[13px] text-text-main leading-relaxed italic">&ldquo;{item.after}&rdquo;</p>
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
          : 'border-border-color bg-slate-50/50 dark:bg-slate-800/20 opacity-60'
      }`}
    >
      {/* Header */}
      <div className="px-4 py-3 flex items-center justify-between gap-3 border-b border-border-color">
        <div className="flex items-center gap-2 min-w-0">
          <div className={`w-2 h-2 rounded-full shrink-0 ${
            change.changeType === 'rewrite' ? 'bg-blue-500' :
            change.changeType === 'enhance' ? 'bg-purple-500' : 'bg-amber-500'
          }`} />
          <span className="text-[11px] font-bold text-text-muted uppercase tracking-wider truncate">
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
                : 'bg-slate-200 dark:bg-slate-700 text-slate-400 dark:text-slate-500'
            }`}
          >
            {accepted ? <Check className="w-3.5 h-3.5" /> : <X className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Diff content */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-0 md:divide-x divide-border-color">
        {/* Original */}
        <div className="px-4 py-3 bg-red-50/30 dark:bg-red-900/5">
          <p className="text-[10px] font-bold text-red-500 dark:text-red-400 uppercase tracking-wider mb-1.5 flex items-center gap-1">
            <Minus className="w-3 h-3" /> Original
          </p>
          <p className="text-[13px] text-text-main/80 leading-relaxed whitespace-pre-wrap">
            {change.original}
          </p>
        </div>
        {/* Optimized */}
        <div className="px-4 py-3 bg-emerald-50/30 dark:bg-emerald-900/5 border-t md:border-t-0 border-border-color">
          <p className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider mb-1.5 flex items-center gap-1">
            <Plus className="w-3 h-3" /> Optimized
          </p>
          <p className="text-[13px] text-text-main/80 leading-relaxed whitespace-pre-wrap">
            {change.optimized}
          </p>
        </div>
      </div>

      {/* Reason */}
      <div className="px-4 py-2 bg-slate-50/50 dark:bg-slate-800/30 border-t border-border-color">
        <p className="text-[11px] text-text-muted italic flex items-center gap-1.5">
          <Sparkles className="w-3 h-3 text-amber-500 shrink-0" />
          {change.reason}
        </p>
      </div>
    </motion.div>
  );
};

// ── Spinner ────────────────────────────────────────────────────────────────────
const Spinner = ({ label, messages }) => {
  const [msgIdx, setMsgIdx] = useState(0);

  useEffect(() => {
    if (!messages || messages.length === 0) return;
    const interval = setInterval(() => {
      setMsgIdx(prev => (prev < messages.length - 1 ? prev + 1 : prev));
    }, 3500);
    return () => clearInterval(interval);
  }, [messages]);

  return (
    <div className="flex flex-col items-center gap-3.5 py-12">
      <div className="w-11 h-11 rounded-full border-[3px] border-slate-200 dark:border-slate-700 border-t-accent-600 animate-spin" />
      <p className="text-sm text-text-muted">
        {messages ? messages[msgIdx] : label}
      </p>
    </div>
  );
};

// Design system constants — aligned with Card component tokens
const panelClass = "rounded-xl border border-border-color bg-slate-50 p-5 dark:bg-slate-900/60";

// ── Main Page ──────────────────────────────────────────────────────────────────
const ResumeAI = () => {
  const { user } = useContext(AuthContext);
  const { startTask, getTask, clearTask, getPageState, setPageState } = useContext(TaskContext);
  const navigate = useNavigate();

  // Derive improve state from TaskContext
  const improveTask = getTask('resume-improve');
  const improveLoading = improveTask?.status === 'running';
  const improveFeedback = improveTask?.status === 'completed' ? improveTask.result : null;
  const improveError = improveTask?.status === 'failed' ? improveTask.error : '';

  // Hydrate local state from persisted page state
  const persisted = getPageState('resume-ai');

  // Optimize state (Section 2) — persisted
  const [jobDesc, setJobDesc]               = useState(persisted?.jobDesc || '');
  const [optimizeResult, setOptimizeResult] = useState(persisted?.optimizeResult || null);
  const [optimizeLoading, setOptimizeLoading] = useState(false);
  const [optimizeError, setOptimizeError]   = useState('');

  // Derive optimize-from-feedback state from TaskContext
  const optimizeFbTask = getTask('resume-optimize-feedback');
  const optimizing = optimizeFbTask?.status === 'running';
  const optimizeData = optimizeFbTask?.status === 'completed' ? optimizeFbTask.result : null;
  const optimizeFeedbackError = optimizeFbTask?.status === 'failed' ? optimizeFbTask.error : '';

  const [acceptedChanges, setAcceptedChanges] = useState(persisted?.acceptedChanges || {});
  const [savingOptimized, setSavingOptimized] = useState(false);
  const [generatingLatex, setGeneratingLatex] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState('');
  const [localError, setLocalError] = useState('');

  // Pre-accept all changes when optimize completes
  useEffect(() => {
    if (optimizeData?.sections) {
      const accepted = {};
      (optimizeData.sections || []).forEach(s =>
        (s.changes || []).forEach(c => { accepted[c.id] = true; })
      );
      setAcceptedChanges(accepted);
    }
  }, [optimizeData]);

  // Persist local state to context on change
  useEffect(() => {
    setPageState('resume-ai', { jobDesc, optimizeResult, acceptedChanges });
  }, [jobDesc, optimizeResult, acceptedChanges, setPageState]);

  const cfg = { headers: { Authorization: `Bearer ${user?.token}` } };

  // ── Handlers ─────────────────────────────────────────────────────────────────
  const handleImprove = async () => {
    // Clear old optimize state
    if (optimizeFbTask) clearTask('resume-optimize-feedback');
    setAcceptedChanges({});

    startTask(
      'resume-improve',
      'Analyzing Resume',
      async () => {
        const res = await axios.post(`${API_URL}/resume/improve`, {}, cfg);
        return res.data;
      },
      '/resume-ai',
      [
        "Reading resume contents...",
        "Analyzing structure and ATS compatibility...",
        "Evaluating career trajectory and impact...",
        "Identifying missing keywords and gaps...",
        "Generating tailored feedback...",
        "Finalizing score..."
      ]
    );
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
    setSaveSuccess('');
    startTask(
      'resume-optimize-feedback',
      'Optimizing Resume',
      async () => {
        const res = await axios.post(`${API_URL}/resume/optimize-from-feedback`,
          { feedback: improveFeedback }, cfg);
        return res.data;
      },
      '/resume-ai',
      [
        "Reviewing approved suggestions...",
        "Restructuring sentences for maximum impact...",
        "Adding strong action verbs and metrics...",
        "Ensuring 100% ATS compatibility...",
        "Finalizing your optimized profile..."
      ]
    );
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
      setLocalError(err.response?.data?.message || 'Failed to save optimized profile.');
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
      setLocalError(err.response?.data?.message || 'Failed to generate LaTeX.');
    } finally {
      setGeneratingLatex(false);
    }
  };

  // ── Not logged in ─────────────────────────────────────────────────────────────
  if (!user) {
    return (
      <div className="min-h-[calc(100vh-54px)] flex items-center justify-center bg-bg-main p-6">
        <Card className="p-12 px-10 text-center max-w-[400px]">
          <AlertCircle className="w-10 h-10 text-red-500 mx-auto mb-5" />
          <h2 className="text-2xl font-bold text-text-main tracking-tight mb-2">Sign in required</h2>
          <p className="text-text-muted text-[15px] mb-7">Sign in and upload your resume to use AI Resume tools.</p>
          <Link to="/login"><Button>Sign In</Button></Link>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-text-main sm:text-3xl">Resume Analyzer</h1>
        <p className="text-sm text-text-muted mt-1">
          Get expert-level feedback and tailor your resume for any role.
        </p>
      </div>

        {/* ══════════════════════════════════════════════════════════════════════
            SECTION 1 — Improve Your Resume
        ══════════════════════════════════════════════════════════════════════ */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.05 }}>
          <Card className="p-6 mb-6">

            {/* Header */}
            <div className="flex items-start justify-between gap-4 mb-7 flex-wrap">
              <div>
                <div className="flex items-center gap-2.5 mb-1.5">
                  <div className="w-2 h-2 rounded-full bg-accent-600" />
                  <p className="text-[11px] font-bold text-text-muted uppercase tracking-widest">
                    Section 1
                  </p>
                </div>
                <h2 className="text-2xl font-bold text-text-main tracking-tight mb-1.5">
                  Improve Your Resume
                </h2>
                <p className="text-sm text-text-muted max-w-[480px]">
                  Get a comprehensive AI audit of your resume — covering structure, impact, ATS optimization, and skill gaps.
                </p>
              </div>
              <div className="flex gap-2 items-center">
                <Badge variant="secondary" className="text-[11px]">🔴 Critical fixes</Badge>
                <Badge variant="secondary" className="text-[11px]">🟡 Suggestions</Badge>
                <Badge variant="secondary" className="text-[11px]">🟢 Strengths</Badge>
              </div>
            </div>

            {/* CTA */}
            {!improveFeedback && !improveLoading && (
              <div className="flex flex-col items-center py-8 pb-4">
                <div className="w-16 h-16 rounded-2xl bg-bg-card border border-border-color flex items-center justify-center mb-4 shadow-sm">
                  <Sparkles className="w-7 h-7 text-accent-700 dark:text-accent-400" />
                </div>
                <p className="text-base font-semibold text-text-main mb-1.5">Ready to analyze your resume</p>
                <p className="text-sm text-text-muted mb-6 text-center max-w-[380px]">
                  Our AI will review your resume like a senior recruiter at a top tech company.
                </p>
                <Button onClick={handleImprove} className="gap-2">
                  Analyze My Resume
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
            )}

            {/* Loading */}
            {improveLoading && (
              <Spinner 
                messages={[
                  "Reading resume contents...",
                  "Analyzing structure and ATS compatibility...",
                  "Evaluating career trajectory and impact...",
                  "Identifying missing keywords and gaps...",
                  "Generating tailored feedback...",
                  "Finalizing score..."
                ]} 
              />
            )}

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
                      <p className="text-[11px] font-bold text-text-muted uppercase tracking-widest mb-1.5">
                        Resume Score
                      </p>
                      <p className="text-lg font-semibold text-text-main leading-snug tracking-tight mb-2">
                        {improveFeedback.summary}
                      </p>
                      <div className="flex items-center gap-3 flex-wrap">
                        <button
                          onClick={() => { clearTask('resume-improve'); clearTask('resume-optimize-feedback'); handleImprove(); }}
                          className="text-xs text-blue-600 dark:text-blue-400 bg-transparent border-none cursor-pointer p-0 flex items-center gap-1 hover:underline"
                        >
                          <RefreshCw className="w-3 h-3" /> Re-analyze
                        </button>
                        <div className="w-px h-3.5 bg-slate-300 dark:bg-slate-600" />
                        <Button
                          onClick={handleOptimizeFromFeedback}
                          disabled={optimizing}
                          size="sm"
                          className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-bold text-white bg-accent-700 shadow-sm hover:bg-accent-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
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
                        </Button>
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
          </Card>
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
              className="mb-6"
            >
              <Card className="p-6">
                <Spinner 
                  messages={[
                    "Reviewing approved suggestions...",
                    "Restructuring sentences for maximum impact...",
                    "Adding strong action verbs and metrics...",
                    "Ensuring 100% ATS compatibility...",
                    "Finalizing your optimized profile..."
                  ]} 
                />
              </Card>
            </motion.div>
          )}

          {(optimizeFeedbackError || localError) && !optimizing && (
            <motion.div
              key="optimize-error"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              className="mb-6"
            >
              <Card className="p-6">
                <div className="bg-red-50 dark:bg-red-900/10 rounded-xl px-4 py-3.5 flex items-center gap-2.5">
                  <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
                  <p className="text-sm text-red-600 dark:text-red-400">{optimizeFeedbackError || localError}</p>
                </div>
              </Card>
            </motion.div>
          )}

          {optimizeData && !optimizing && (
            <Card
              className="mb-6"
            >
              {/* Header */}
              <div className="flex items-start justify-between gap-4 mb-6 flex-wrap">
                <div>
                  <div className="flex items-center gap-2.5 mb-1.5">
                    <div className="w-2 h-2 rounded-full bg-emerald-500" />
                    <p className="text-[11px] font-bold text-text-muted uppercase tracking-widest">
                      Optimization Results
                    </p>
                  </div>
                  <h2 className="text-2xl font-bold text-text-main tracking-tight mb-1.5">
                    Review Changes
                  </h2>
                  <p className="text-sm text-text-muted max-w-[520px]">
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
              <div className="flex items-center justify-between mb-5 pb-4 border-b border-border-color">
                <p className="text-sm text-text-muted">
                  <span className="font-semibold text-text-main">{getAcceptedCount()}</span> of{' '}
                  <span className="font-semibold text-text-main">{getTotalCount()}</span> changes accepted
                </p>
                <div className="flex items-center gap-2">
                  <Button
                    onClick={acceptAll}
                    size="sm"
                    variant="outline"
                    className="text-emerald-700 dark:text-emerald-400 border-emerald-500/20 hover:bg-emerald-100 dark:hover:bg-emerald-900/30"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 mr-1.5" /> Accept All
                  </Button>
                  <Button
                    onClick={rejectAll}
                    size="sm"
                    variant="outline"
                    className="text-text-muted border-border-color hover:bg-slate-200 dark:hover:bg-slate-700"
                  >
                    <XCircle className="w-3.5 h-3.5 mr-1.5" /> Reject All
                  </Button>
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
                      <h3 className="text-sm font-bold text-text-main tracking-tight">
                        {section.sectionName}
                      </h3>
                      <span className="text-[10px] font-medium text-text-muted uppercase tracking-wider">
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
              <div className="mt-6 pt-5 border-t border-border-color flex flex-wrap items-center gap-3">
                <Button
                  onClick={handleSaveToProfile}
                  disabled={savingOptimized || getAcceptedCount() === 0}
                  variant="secondary"
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
                </Button>

                <Button
                  onClick={handleGenerateLatex}
                  disabled={generatingLatex || getAcceptedCount() === 0}
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
                </Button>
              </div>
            </Card>
          )}
        </AnimatePresence>

        {/* ══════════════════════════════════════════════════════════════════════
            SECTION 2 — Optimize Resume for Company
        ══════════════════════════════════════════════════════════════════════ */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.1 }}>
          <Card className="p-6">

            {/* Header */}
            <div className="mb-7">
              <div className="flex items-center gap-2.5 mb-1.5">
                <div className="w-2 h-2 rounded-full bg-indigo-500" />
                <p className="text-[11px] font-bold text-text-muted uppercase tracking-widest">
                  Section 2
                </p>
              </div>
              <h2 className="text-2xl font-bold text-text-main tracking-tight mb-1.5">
                Optimize Resume for Company
              </h2>
              <p className="text-sm text-text-muted max-w-[520px]">
                Paste a job description or company overview — our AI cross-references it with your resume and gives you a precise tailoring plan.
              </p>
            </div>

            {/* Input area */}
            <div className="mb-4">
              <label className="text-[13px] font-semibold text-text-main flex items-center gap-1.5 mb-2">
                <Building2 className="w-3.5 h-3.5 text-indigo-500" />
                Job Description / Company Requirements
              </label>
              <textarea
                value={jobDesc}
                onChange={e => { setJobDesc(e.target.value); setOptimizeError(''); }}
                placeholder={"Paste the full job description, role requirements, or company overview here…\n\nExample: 'We are looking for a React Developer with experience in TypeScript, Next.js, AWS, and GraphQL. The ideal candidate has 2+ years of frontend experience and has shipped production-grade applications...'"}
                className="block min-h-[220px] w-full resize-y rounded-xl border border-border-color bg-bg-card px-4 py-3 text-sm leading-6 text-text-main outline-none transition placeholder:text-text-muted/60 focus:border-accent-500 focus:ring-4 focus:ring-accent-500/10"
              />
              <div className="flex justify-between mt-1.5">
                <p className={`text-xs ${jobDesc.length < 20 ? 'text-red-500' : 'text-text-muted'}`}>
                  {jobDesc.length} characters {jobDesc.length < 20 ? `(need ${20 - jobDesc.length} more)` : ''}
                </p>
                {jobDesc.length > 0 && (
                  <button
                    onClick={() => { setJobDesc(''); setOptimizeResult(null); setOptimizeError(''); }}
                    className="text-xs text-text-muted bg-transparent border-none cursor-pointer hover:underline"
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

            <Button
              onClick={handleOptimize}
              disabled={optimizeLoading || jobDesc.trim().length < 20}
              className={`w-full ${optimizeResult || optimizeLoading ? 'mb-8' : 'mb-0'}`}
              isLoading={optimizeLoading}
              icon={!optimizeLoading ? Zap : undefined}
            >
              {optimizeLoading ? 'Analyzing & optimizing…' : 'Analyze & Optimize'}
            </Button>

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
                      <p className="text-[11px] font-bold text-text-muted uppercase tracking-widest mb-1.5">
                        Current Match Score
                      </p>
                      <p className="text-base font-semibold text-text-main leading-snug tracking-tight mb-2.5">
                        {optimizeResult.companySummary}
                      </p>
                      {optimizeResult.keywords?.length > 0 && (
                        <div>
                          <p className="text-[11px] font-semibold text-text-muted mb-1.5">Missing ATS keywords:</p>
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
                  <motion.div variants={fadeUp} className="mt-6 pt-5 border-t border-border-color flex justify-end">
                    <button
                      onClick={() => { setOptimizeResult(null); setJobDesc(''); }}
                      className="text-[13px] text-text-muted bg-transparent border-none cursor-pointer flex items-center gap-1.5 hover:underline"
                    >
                      <RefreshCw className="w-3.5 h-3.5" /> Try another job description
                    </button>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </Card>
        </motion.div>

    </div>
  );
};

export default ResumeAI;
