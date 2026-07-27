import { useState, useContext, useEffect, useRef } from 'react';
import api from '../services/api';
import AuthContext from '../context/AuthContext';
import TaskContext from '../context/TaskContext';
import { Link, useNavigate } from 'react-router-dom';
import {
  AlertCircle, CheckCircle, AlertTriangle, Sparkles,
  Building2, ChevronDown, ChevronUp, Plus, Minus,
  RefreshCw, Zap, ArrowRight, MapPin, Wand2,
  Check, X, CheckCircle2, XCircle, Save, FileText,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';



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

// ── Collapsible feedback card (with location + quote + preview) ────────────────
const FeedbackCard = ({ item, type }) => {
  const [open, setOpen] = useState(false);

  const config = {
    critical: {
      dot: 'bg-red-500',
      container: 'border-red-500/30 hover:border-red-500/50 bg-red-50/40 dark:bg-red-950/15',
      iconBg: 'bg-red-500/10 dark:bg-red-500/20',
      icon: <AlertCircle className="w-4 h-4 text-red-500" />,
      label: 'Critical',
      labelColor: 'text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/30',
      headerColor: 'text-red-600 dark:text-red-400',
    },
    suggested: {
      dot: 'bg-orange-400',
      container: 'border-orange-400/25 hover:border-orange-400/40 bg-orange-50/40 dark:bg-orange-950/15',
      iconBg: 'bg-orange-500/10 dark:bg-orange-500/20',
      icon: <AlertTriangle className="w-4 h-4 text-orange-500" />,
      label: 'Suggested',
      labelColor: 'text-orange-600 dark:text-orange-400 bg-orange-100 dark:bg-orange-900/30',
      headerColor: 'text-orange-600 dark:text-orange-400',
    },
    good: {
      dot: 'bg-emerald-500',
      container: 'border-emerald-500/25 hover:border-emerald-500/40 bg-emerald-50/40 dark:bg-emerald-950/15',
      iconBg: 'bg-emerald-500/10 dark:bg-emerald-500/20',
      icon: <CheckCircle className="w-4 h-4 text-emerald-500" />,
      label: 'Strength',
      labelColor: 'text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-900/30',
      headerColor: 'text-emerald-600 dark:text-emerald-400',
    },
  };

  const c = config[type];
  const preview = item.detail ? item.detail.substring(0, 80) + (item.detail.length > 80 ? '...' : '') : '';

  return (
    <div className={`rounded-xl border transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg ${c.container} ${open ? 'border-l-[3px]' : 'border-l-[3px]'}`}>
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full border-none bg-transparent px-4 py-3 flex items-start gap-3 cursor-pointer text-left"
      >
        <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${c.iconBg}`}>
          {c.icon}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="text-sm font-semibold text-text-main tracking-tight">{item.issue}</p>
            <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded shrink-0 ${c.labelColor}`}>{c.label}</span>
          </div>
          {item.location && (
            <p className="text-[11px] font-medium text-text-muted mt-0.5 flex items-center gap-1">
              <MapPin className="w-3 h-3 shrink-0" />
              {item.location}
            </p>
          )}
          {!open && preview && (
            <p className="text-[11px] text-text-muted/70 mt-1 leading-relaxed line-clamp-1">{preview}</p>
          )}
        </div>
        <div className="flex items-center gap-1.5 shrink-0 mt-0.5">
          {open ? (
            <ChevronUp className="w-4 h-4 text-slate-400" />
          ) : (
            <ChevronDown className="w-4 h-4 text-slate-400" />
          )}
        </div>
      </button>

      <>
        {open && (
          <div
            key="improve-content"
            
            
            
            
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 pl-[52px] space-y-2.5">
              {item.quote && item.quote !== '[Section not found]' && (
                <div className="bg-white/60 dark:bg-slate-800/40 rounded-lg px-3.5 py-2 border-l-[3px] border-l-slate-400 dark:border-l-slate-500">
                  <p className="text-[10px] font-bold text-text-muted uppercase tracking-wider mb-0.5 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                    From your resume
                  </p>
                  <p className="text-[13px] text-text-main/80 leading-relaxed italic">
                    &ldquo;{item.quote}&rdquo;
                  </p>
                </div>
              )}
              {item.quote === '[Section not found]' && (
                <div className="bg-amber-50/60 dark:bg-amber-900/20 rounded-lg px-3.5 py-2 border-l-[3px] border-l-amber-400 flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                  <p className="text-[12px] text-amber-700 dark:text-amber-400 font-medium">
                    This section is missing from your resume
                  </p>
                </div>
              )}
              <p className="text-[13px] text-text-main/80 leading-relaxed">
                {item.detail}
              </p>
              {item.example && (
                <div className="bg-blue-50/60 dark:bg-blue-950/20 rounded-lg px-3.5 py-2.5 border-l-[3px] border-l-blue-500">
                  <p className="text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider mb-1 flex items-center gap-1">
                    <Sparkles className="w-3 h-3" />
                    Example
                  </p>
                  <p className="text-[13px] text-text-main leading-relaxed italic">
                    &ldquo;{item.example}&rdquo;
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </>
    </div>
  );
};

// ── Optimize result card ───────────────────────────────────────────────────────
const OptimizeCard = ({ item, type }) => {
  const [open, setOpen] = useState(false);

  const config = {
    add: {
      container: 'border-green-500/25 hover:border-green-500/40 bg-green-50/30 dark:bg-green-950/10',
      iconBg: 'bg-green-500/10 dark:bg-green-500/20',
      icon: <Plus className="w-3.5 h-3.5 text-green-600 dark:text-green-500" />,
    },
    remove: {
      container: 'border-red-500/20 hover:border-red-500/35 bg-red-50/30 dark:bg-red-950/10',
      iconBg: 'bg-red-500/10 dark:bg-red-500/20',
      icon: <Minus className="w-3.5 h-3.5 text-red-600 dark:text-red-500" />,
    },
    modify: {
      container: 'border-blue-500/25 hover:border-blue-500/40 bg-blue-50/30 dark:bg-blue-950/10',
      iconBg: 'bg-blue-500/10 dark:bg-blue-500/20',
      icon: <RefreshCw className="w-3.5 h-3.5 text-blue-600 dark:text-blue-500" />,
    },
  };

  const c = config[type];

  return (
    <div className={`rounded-xl border transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg ${c.container}`}>
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

      <>
        {open && (
          <div
            key="optimize-content"
            
            
            
            
            className="overflow-hidden"
          >
            <div className="px-4 pb-3.5 pl-[52px] flex flex-col gap-2">
              {item.reason && (
                <p className="text-[13px] text-text-muted leading-relaxed">{item.reason}</p>
              )}
              {item.howTo && (
                <div className="bg-white/60 dark:bg-slate-800/40 rounded-lg px-3.5 py-2.5 border border-border-color">
                  <p className="text-[10px] font-bold text-text-muted uppercase tracking-wider mb-1 flex items-center gap-1">
                    <Wand2 className="w-3 h-3" />
                    How to add
                  </p>
                  <p className="text-[13px] text-text-main leading-relaxed">{item.howTo}</p>
                </div>
              )}
              {item.before && (
                <div className="flex flex-col gap-1.5">
                  <div className="bg-red-50/40 dark:bg-red-900/10 rounded-lg px-3.5 py-2.5 border border-red-500/20 dark:border-red-500/25">
                    <p className="text-[10px] font-bold text-red-500 dark:text-red-400 uppercase tracking-wider mb-1 flex items-center gap-1">
                      <Minus className="w-3 h-3" /> Before
                    </p>
                    <p className="text-[13px] text-text-main/80 leading-relaxed line-through decoration-red-400/40">&ldquo;{item.before}&rdquo;</p>
                  </div>
                  <div className="bg-emerald-50/40 dark:bg-emerald-900/10 rounded-lg px-3.5 py-2.5 border border-emerald-500/20 dark:border-emerald-500/25">
                    <p className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider mb-1 flex items-center gap-1">
                      <Check className="w-3 h-3" /> After
                    </p>
                    <p className="text-[13px] text-text-main leading-relaxed">&ldquo;{item.after}&rdquo;</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </>
    </div>
  );
};

// ── Diff Card for accept/reject individual changes ─────────────────────────────
const DiffCard = ({ change, accepted, onToggle }) => {
  const statusColors = accepted
    ? 'border-emerald-500/40 bg-emerald-50/20 dark:bg-emerald-900/10 shadow-md shadow-emerald-500/5'
    : 'border-border-color bg-white/30 dark:bg-slate-800/10 opacity-60';

  const statusDot = accepted ? 'bg-emerald-500' : 'bg-slate-400';

  return (
    <div
      
      
      className={`rounded-xl border transition-all duration-400 ${statusColors} relative overflow-hidden`}
    >
      {/* Accepted/Rejected strip */}
      <div className={`absolute top-0 left-0 w-1 h-full transition-colors duration-300 ${accepted ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-600'}`} />

      {/* Header */}
      <div className="px-4 py-3 flex items-center justify-between gap-3 border-b border-border-color">
        <div className="flex items-center gap-2.5 min-w-0">
          <span className={`w-2 h-2 rounded-full shrink-0 transition-colors duration-300 ${statusDot}`} />
          <div className="flex items-center gap-2 min-w-0">
            <span className="text-[11px] font-bold text-text-muted uppercase tracking-wider truncate">
              {change.field}
            </span>
            <Badge variant={
              change.changeType === 'rewrite' ? 'default' :
              change.changeType === 'enhance' ? 'secondary' : 'warning'
            } className="text-[9px] px-1.5 py-0 font-semibold">
              {change.changeType}
            </Badge>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className={`text-[10px] font-semibold flex items-center gap-1 transition-all duration-300 ${
            accepted ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400 dark:text-slate-500'
          }`}>
            {accepted ? (
              <><CheckCircle2 className="w-3.5 h-3.5" /> Accepted</>
            ) : (
              <><XCircle className="w-3.5 h-3.5" /> Pending</>
            )}
          </span>
          <button
            onClick={onToggle}
            className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all duration-200 border-2 active:scale-95 ${
              accepted
                ? 'bg-emerald-500 border-emerald-500 text-white shadow-md shadow-emerald-500/30'
                : 'bg-white dark:bg-slate-700 border-slate-300 dark:border-slate-600 text-slate-400 dark:text-slate-500 hover:border-slate-400 dark:hover:border-slate-500'
            }`}
            title={accepted ? 'Reject change' : 'Accept change'}
          >
            {accepted ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Diff content with highlighting */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-0 md:divide-x divide-border-color">
        <div className="px-4 py-3 bg-gradient-to-r from-red-50/40 to-transparent dark:from-red-950/10">
          <p className="text-[10px] font-bold text-red-500 dark:text-red-400 uppercase tracking-wider mb-1.5 flex items-center gap-1">
            <Minus className="w-3 h-3" /> Original
          </p>
          <p className="text-[13px] text-text-main/80 leading-relaxed whitespace-pre-wrap bg-red-500/[0.04] dark:bg-red-500/[0.06] rounded px-1.5 -mx-1.5 py-0.5 line-through decoration-red-400/30">
            {change.original}
          </p>
        </div>
        <div className="px-4 py-3 bg-gradient-to-l from-emerald-50/40 to-transparent dark:from-emerald-950/10 border-t md:border-t-0 border-border-color">
          <p className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider mb-1.5 flex items-center gap-1">
            <Check className="w-3 h-3" /> Optimized
          </p>
          <p className="text-[13px] text-text-main/80 leading-relaxed whitespace-pre-wrap bg-emerald-500/[0.06] dark:bg-emerald-500/[0.08] rounded px-1.5 -mx-1.5 py-0.5">
            {change.optimized}
          </p>
        </div>
      </div>

      {/* Reason */}
      <div className="px-4 py-2.5 bg-amber-50/30 dark:bg-amber-950/10 border-t border-border-color">
        <p className="text-[11px] text-text-muted flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-amber-500 shrink-0" />
          <span className="font-medium text-text-main/70">Why:</span>
          {change.reason}
        </p>
      </div>
    </div>
  );
};

// ── Profile Preview (for Original / Optimized toggle view) ─────────────────────
const ProfilePreview = ({ profile, label }) => {
  if (!profile) return null;
  const { basics, skills, experience, education, projects } = profile;

  return (
    <div className="space-y-4">
      {/* Header */}
      {basics && (
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h2 className="text-lg font-bold text-text-main">{basics.name || 'Untitled'}</h2>
            <p className="text-sm text-text-muted mt-0.5">{basics.email}{basics.email && basics.phone ? ' · ' : ''}{basics.phone}</p>
            {(basics.linkedin || basics.github) && (
              <p className="text-xs text-text-muted mt-0.5">
                {basics.linkedin && <span className="mr-3">LinkedIn: {basics.linkedin}</span>}
                {basics.github && <span>GitHub: {basics.github}</span>}
              </p>
            )}
          </div>
          <Badge variant="outline" className="text-[10px]">{label}</Badge>
        </div>
      )}

      {basics?.summary && (
        <div className="bg-white/50 dark:bg-slate-800/30 rounded-lg px-4 py-3 border border-border-color">
          <p className="text-[10px] font-bold text-text-muted uppercase tracking-wider mb-1">Summary</p>
          <p className="text-[13px] text-text-main/80 leading-relaxed">{basics.summary}</p>
        </div>
      )}

      {/* Experience */}
      {experience?.length > 0 && (
        <div>
          <p className="text-[11px] font-bold text-text-muted uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <Building2 className="w-3 h-3" /> Experience ({experience.length})
          </p>
          <div className="space-y-2">
            {experience.map((exp, i) => (
              <div key={i} className="bg-white/50 dark:bg-slate-800/30 rounded-lg px-4 py-3 border border-border-color">
                <div className="flex items-start justify-between gap-3 flex-wrap">
                  <div>
                    <p className="text-sm font-semibold text-text-main">{exp.role || 'Role'}</p>
                    <p className="text-xs text-text-muted">{exp.company || 'Company'}{exp.duration ? ` · ${exp.duration}` : ''}</p>
                  </div>
                </div>
                {exp.description && (
                  <div className="mt-1.5 text-[13px] text-text-main/80 leading-relaxed whitespace-pre-wrap">
                    {Array.isArray(exp.description)
                      ? exp.description.map((d, j) => <p key={j} className="mb-0.5">• {d}</p>)
                      : <p>{exp.description}</p>}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Education */}
      {education?.length > 0 && (
        <div>
          <p className="text-[11px] font-bold text-text-muted uppercase tracking-wider mb-2">Education ({education.length})</p>
          <div className="space-y-2">
            {education.map((edu, i) => (
              <div key={i} className="bg-white/50 dark:bg-slate-800/30 rounded-lg px-4 py-3 border border-border-color">
                <p className="text-sm font-semibold text-text-main">{edu.degree || 'Degree'} at {edu.institution || 'School'}</p>
                {edu.duration && <p className="text-xs text-text-muted mt-0.5">{edu.duration}</p>}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Skills */}
      {skills?.length > 0 && (
        <div className="bg-white/50 dark:bg-slate-800/30 rounded-lg px-4 py-3 border border-border-color">
          <p className="text-[10px] font-bold text-text-muted uppercase tracking-wider mb-1.5">Skills</p>
          <div className="flex flex-wrap gap-1.5">
            {(Array.isArray(skills) ? skills : []).map((s, i) => (
              <span key={i} className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-accent-500/10 text-accent-700 dark:text-accent-300 border border-accent-500/20">
                {s}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Projects */}
      {projects?.length > 0 && (
        <div>
          <p className="text-[11px] font-bold text-text-muted uppercase tracking-wider mb-2">Projects ({projects.length})</p>
          <div className="space-y-2">
            {projects.map((proj, i) => (
              <div key={i} className="bg-white/50 dark:bg-slate-800/30 rounded-lg px-4 py-3 border border-border-color">
                <p className="text-sm font-semibold text-text-main">{proj.name || 'Project'}</p>
                {proj.techStack && <p className="text-xs text-text-muted mt-0.5">{Array.isArray(proj.techStack) ? proj.techStack.join(', ') : proj.techStack}</p>}
                {proj.description && <p className="text-[13px] text-text-main/80 leading-relaxed mt-1">{proj.description}</p>}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
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
const EXAMPLE_JD = `We are looking for a Senior Frontend Engineer to join our core product team. You will build and maintain high-performance React applications used by millions of users worldwide.

Requirements:
• 5+ years of experience in frontend development
• Deep expertise in React, TypeScript, and modern CSS (Tailwind, CSS Modules)
• Experience with state management (Redux, Zustand, or Context API)
• Strong understanding of web performance optimization (Core Web Vitals, lazy loading, code splitting)
• Experience with RESTful APIs and GraphQL
• Familiarity with testing frameworks (Jest, React Testing Library, Cypress)
• Bachelor's degree in Computer Science or equivalent

Nice to have:
• Experience with Next.js or Remix
• Knowledge of Node.js backend development
• Experience with CI/CD pipelines
• Open source contributions

We offer competitive salary, equity, remote-first culture, and annual learning budget.`;

const ResumeAI = () => {
  useEffect(() => { document.title = 'Resume Analyzer | CareerLens'; }, []);
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
  const [generatedVersionId, setGeneratedVersionId] = useState(null);
  const [generatingLatexError, setGeneratingLatexError] = useState('');
  const [saveSuccess, setSaveSuccess] = useState('');
  const [acceptAllStatus, setAcceptAllStatus] = useState(''); // '' | 'saving' | 'done'
  const [localError, setLocalError] = useState('');
  const [originalProfile, setOriginalProfile] = useState(null);
  const [viewMode, setViewMode] = useState('changes');

  const handleKeyDown = (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      if (!improveFeedback && !improveLoading) {
        handleImprove();
      }
    }
  };

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

  // Auto-generate LaTeX when optimize completes and all changes are pre-accepted
  const prevOptimizeDataRef = useRef(null);
  useEffect(() => {
    if (!optimizeData?.optimizedProfile) return;
    if (prevOptimizeDataRef.current === optimizeData) return;
    prevOptimizeDataRef.current = optimizeData;
    setGeneratedVersionId(null);
    setGeneratingLatexError('');
    generateLatexSilent(optimizeData.optimizedProfile);
  }, [optimizeData]);

  // Persist local state to context on change
  useEffect(() => {
    setPageState('resume-ai', { jobDesc, optimizeResult, acceptedChanges });
  }, [jobDesc, optimizeResult, acceptedChanges, setPageState]);

  const cfg = { headers: { Authorization: `Bearer ${user?.token}` } };

  // ── Silent LaTeX generation (no navigation) ──────────────────────────────────
  const generateLatexSilent = async (profile) => {
    setGeneratingLatex(true);
    setGeneratingLatexError('');
    try {
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

      const { data } = await api.post(`/resume/latex/generate`, { resumeData }, cfg);
      const versionRes = await api.post(`/resume/versions`, {
        title: 'AI Optimized Resume',
        rawLatexCode: data.rawLatexCode,
        source: 'ai-optimized',
      }, cfg);

      setGeneratedVersionId(versionRes.data._id);
    } catch (err) {
      setGeneratingLatexError(err.response?.data?.message || 'Failed to generate LaTeX.');
    } finally {
      setGeneratingLatex(false);
    }
  };

  // ── Handlers ─────────────────────────────────────────────────────────────────
  const handleImprove = async () => {
    // Clear old optimize state
    if (optimizeFbTask) clearTask('resume-optimize-feedback');
    setAcceptedChanges({});

    startTask(
      'resume-improve',
      'Analyzing Resume',
      async () => {
        const res = await api.post(`/resume/improve`, {}, cfg);
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
      const res = await api.post(`/resume/optimize`, { jobDescription: jobDesc }, cfg);
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
    setViewMode('changes');
    // Fetch original profile for the toggle view
    api.get(`/profile`, cfg).then(res => {
      setOriginalProfile(res.data);
    }).catch(() => {});
    startTask(
      'resume-optimize-feedback',
      'Optimizing Resume',
      async () => {
        const res = await api.post(`/resume/optimize-from-feedback`,
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

  const acceptAll = async () => {
    const accepted = {};
    (optimizeData?.sections || []).forEach(s =>
      (s.changes || []).forEach(c => { accepted[c.id] = true; })
    );
    setAcceptedChanges(accepted);
    if (!optimizeData?.optimizedProfile) return;
    setAcceptAllStatus('saving');
    try {
      const profile = optimizeData.optimizedProfile;
      await api.put(`/profile`, {
        basics: profile.basics,
        skills: profile.skills,
        experience: profile.experience,
        education: profile.education,
        projects: profile.projects,
      }, cfg);
      setAcceptAllStatus('done');
      setTimeout(() => setAcceptAllStatus(''), 4000);
    } catch (err) {
      setLocalError(err.response?.data?.message || 'Failed to save optimized profile.');
      setAcceptAllStatus('');
    }
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
      await api.put(`/profile`, {
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

  // ── View or retry LaTeX for optimized content ────────────────────────────────
  const handleViewLatex = () => {
    if (generatedVersionId) {
      navigate('/resume-latex', { state: { versionId: generatedVersionId } });
    }
  };

  const handleRetryLatex = () => {
    if (optimizeData?.optimizedProfile) {
      generateLatexSilent(optimizeData.optimizedProfile);
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
    <div className="max-w-4xl mx-auto space-y-8" onKeyDown={handleKeyDown}>
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
        <div   >
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
              <div role="alert" className="bg-red-50 dark:bg-red-900/10 rounded-xl px-4 py-3.5 flex items-center gap-2.5">
                <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
                <p className="text-sm text-red-600 dark:text-red-400">{improveError}</p>
              </div>
            )}

            {/* Results */}
            <>
              {improveFeedback && (
                <div key="improve-results"   >

                  {/* Score Dashboard — consolidated: score ring + dimension bars + ATS summary */}
                  <div
                    
                    className={`${panelClass} mb-7`}
                  >
                    <div className="flex items-start gap-6 flex-wrap">
                      {/* Left: Score ring */}
                      <div className="flex flex-col items-center shrink-0">
                        <ScoreRing score={improveFeedback.score || 0} size={88} />
                        <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider mt-1.5">Overall</span>
                      </div>

                      {/* Right: Dimension bars */}
                      <div className="flex-1 min-w-[200px] space-y-1.5">
                        <p className="text-[10px] font-bold text-text-muted uppercase tracking-wider mb-1.5">Dimension Breakdown</p>
                        {improveFeedback.dimensionScores && Object.entries(improveFeedback.dimensionScores).map(([key, dim]) => {
                          const barColor = dim.score >= 75 ? '#10b981' : dim.score >= 50 ? '#f59e0b' : '#ef4444';
                          return (
                            <div key={key} className="flex items-center gap-2.5">
                              <span className="text-[11px] text-text-muted w-28 shrink-0 text-right">{dim.label || key}</span>
                              <div className="flex-1 h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                                <div className="h-full rounded-full transition-all duration-700" style={{ width: `${dim.score}%`, backgroundColor: barColor }} />
                              </div>
                              <span className="text-[11px] font-bold w-8 text-right" style={{ color: barColor }}>{dim.score}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* ATS compliance summary (inline, auto-fetched) */}
                    {improveFeedback.atsAnalysis && (
                      <div className="mt-4 pt-3 border-t border-border-color">
                        <div className="flex items-center flex-wrap gap-x-4 gap-y-1.5">
                          <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider">ATS Compliance</span>
                          <span className="text-[11px] font-semibold" style={{
                            color: improveFeedback.atsAnalysis.overallScore >= 70 ? '#10b981' : improveFeedback.atsAnalysis.overallScore >= 40 ? '#f59e0b' : '#ef4444'
                          }}>
                            Score: {improveFeedback.atsAnalysis.overallScore}/100
                          </span>
                          <span className="flex items-center gap-1 text-[11px] text-text-muted">
                            <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                            {improveFeedback.atsAnalysis.checks?.filter(c => c.passed).length || 0}/{improveFeedback.atsAnalysis.checks?.length || 0} checks passed
                          </span>
                          {improveFeedback.atsAnalysis.criticalIssues?.length > 0 && (
                            <span className="flex items-center gap-1 text-[11px] text-red-500">
                              <AlertCircle className="w-3 h-3" />
                              {improveFeedback.atsAnalysis.criticalIssues.length} critical {improveFeedback.atsAnalysis.criticalIssues.length === 1 ? 'issue' : 'issues'}
                            </span>
                          )}
                          {improveFeedback.atsAnalysis.warnings?.length > 0 && (
                            <span className="flex items-center gap-1 text-[11px] text-amber-500">
                              <AlertTriangle className="w-3 h-3" />
                              {improveFeedback.atsAnalysis.warnings.length} warnings
                            </span>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Summary + actions */}
                    <div className="mt-3 pt-3 border-t border-border-color flex items-start justify-between gap-4 flex-wrap">
                      <p className="text-sm font-medium text-text-main leading-relaxed flex-1 min-w-[200px]">
                        {improveFeedback.summary}
                      </p>
                      <div className="flex items-center gap-3 shrink-0">
                        <button
                          onClick={() => { clearTask('resume-improve'); clearTask('resume-optimize-feedback'); handleImprove(); }}
                          className="text-xs text-blue-600 dark:text-blue-400 bg-transparent border-none cursor-pointer flex items-center gap-1 hover:underline"
                        >
                          <RefreshCw className="w-3 h-3" /> Re-analyze
                        </button>
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
                  </div>

                  {/* Critical */}
                  {improveFeedback.critical?.length > 0 && (
                    <div  className="mb-6">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-1 h-8 rounded-full bg-red-500 shrink-0" />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
                            <p className="text-xs font-bold text-red-500 uppercase tracking-widest">
                              Critical — Fix Before Applying
                            </p>
                            <span className="text-[10px] font-bold text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/30 px-1.5 py-0.5 rounded-full shrink-0">
                              {improveFeedback.critical.length}
                            </span>
                          </div>
                          <p className="text-[11px] text-text-muted mt-0.5">These issues will negatively impact your application — address them first</p>
                        </div>
                      </div>
                      <div className="flex flex-col gap-2">
                        {improveFeedback.critical.map((item, i) => (
                          <FeedbackCard key={i} item={item} type="critical" />
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Suggested */}
                  {improveFeedback.suggested?.length > 0 && (
                    <div  className="mb-6">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-1 h-8 rounded-full bg-orange-400 shrink-0" />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <AlertTriangle className="w-4 h-4 text-orange-500 shrink-0" />
                            <p className="text-xs font-bold text-orange-500 uppercase tracking-widest">
                              Suggested Improvements
                            </p>
                            <span className="text-[10px] font-bold text-orange-600 dark:text-orange-400 bg-orange-100 dark:bg-orange-900/30 px-1.5 py-0.5 rounded-full shrink-0">
                              {improveFeedback.suggested.length}
                            </span>
                          </div>
                          <p className="text-[11px] text-text-muted mt-0.5">Strongly recommended changes to strengthen your profile</p>
                        </div>
                      </div>
                      <div className="flex flex-col gap-2">
                        {improveFeedback.suggested.map((item, i) => (
                          <FeedbackCard key={i} item={item} type="suggested" />
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Good */}
                  {improveFeedback.good?.length > 0 && (
                    <div >
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-1 h-8 rounded-full bg-emerald-500 shrink-0" />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
                            <p className="text-xs font-bold text-emerald-500 uppercase tracking-widest">
                              What You're Doing Well
                            </p>
                            <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-900/30 px-1.5 py-0.5 rounded-full shrink-0">
                              {improveFeedback.good.length}
                            </span>
                          </div>
                          <p className="text-[11px] text-text-muted mt-0.5">These strengths are working in your favor — keep them</p>
                        </div>
                      </div>
                      <div className="flex flex-col gap-2">
                        {improveFeedback.good.map((item, i) => (
                          <FeedbackCard key={i} item={item} type="good" />
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </>
          </Card>
        </div>

        {/* ══════════════════════════════════════════════════════════════════════
            SECTION 1B — Optimization Results (Diff Viewer)
        ══════════════════════════════════════════════════════════════════════ */}
        <>
          {optimizing && (
            <div
              key="optimize-loading"
              
              
              
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
            </div>
          )}

          {(optimizeFeedbackError || localError) && !optimizing && (
            <div
              key="optimize-error"
              
              
              
              className="mb-6"
            >
              <Card className="p-6">
                <div className="bg-red-50 dark:bg-red-900/10 rounded-xl px-4 py-3.5 flex items-center gap-2.5">
                  <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
                  <p className="text-sm text-red-600 dark:text-red-400">{optimizeFeedbackError || localError}</p>
                </div>
              </Card>
            </div>
          )}

          {optimizeData && !optimizing && (
            <Card
              className="mb-6 overflow-hidden"
            >
              {/* Summary Bar */}
              <div className="bg-gradient-to-r from-emerald-50/60 via-white to-emerald-50/30 dark:from-emerald-950/10 dark:via-transparent dark:to-emerald-950/5 border-b border-border-color px-5 py-3.5">
                <div className="flex items-center justify-between gap-4 flex-wrap">
                  <div className="flex items-center gap-4 flex-wrap">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-emerald-500" />
                      <p className="text-[11px] font-bold text-text-muted uppercase tracking-widest">Changes</p>
                    </div>
                    <span className="text-sm font-semibold text-text-main">{getAcceptedCount()}/{getTotalCount()}</span>
                    <div className="w-24 h-1.5 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-emerald-500 transition-all duration-500"
                        style={{ width: `${getTotalCount() > 0 ? (getAcceptedCount() / getTotalCount()) * 100 : 0}%` }}
                      />
                    </div>
                    <span className="text-[11px] text-text-muted">
                      {(optimizeData.sections || []).length} section{(optimizeData.sections || []).length !== 1 ? 's' : ''}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    {/* View toggle pills */}
                    <div className="flex items-center bg-slate-100 dark:bg-slate-800 rounded-lg p-0.5 border border-border-color">
                      {['original', 'changes', 'optimized'].map(mode => (
                        <button
                          key={mode}
                          onClick={() => setViewMode(mode)}
                          className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-md transition-all cursor-pointer border-none ${
                            viewMode === mode
                              ? 'bg-white dark:bg-slate-700 text-text-main shadow-sm'
                              : 'text-text-muted hover:text-text-main bg-transparent'
                          }`}
                        >
                          {mode === 'original' ? 'Original' : mode === 'changes' ? 'Changes' : 'Optimized'}
                        </button>
                      ))}
                    </div>
                    <Button
                      onClick={acceptAll}
                      size="sm"
                      disabled={acceptAllStatus === 'saving'}
                      className={`gap-1.5 px-3 py-1.5 text-xs font-bold ${
                        acceptAllStatus === 'done'
                          ? 'bg-emerald-500 text-white'
                          : 'bg-accent-700 hover:bg-accent-800 text-white shadow-sm'
                      }`}
                    >
                      {acceptAllStatus === 'saving' ? (
                        <><div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Saving…</>
                      ) : acceptAllStatus === 'done' ? (
                        <><CheckCircle2 className="w-3.5 h-3.5" /> Saved ✓</>
                      ) : (
                        <><CheckCircle2 className="w-3.5 h-3.5" /> Accept All & Save</>
                      )}
                    </Button>
                    <Button
                      onClick={rejectAll}
                      size="sm"
                      variant="ghost"
                      className="text-text-muted hover:bg-slate-200 dark:hover:bg-slate-700 gap-1.5 px-3 py-1"
                    >
                      <XCircle className="w-3.5 h-3.5" /> Reject All
                    </Button>
                    {optimizeData.estimatedScoreIncrease > 0 && (
                      <div
                        
                        
                        
                        className="flex items-center gap-1.5 bg-emerald-500 text-white px-2.5 py-1.5 rounded-lg shadow-lg shadow-emerald-500/25"
                      >
                        <Zap className="w-3.5 h-3.5" />
                        <span className="text-[11px] font-bold">+{optimizeData.estimatedScoreIncrease} pts</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Header */}
              <div className="px-5 pt-5 pb-1">
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div>
                    <h2 className="text-xl font-bold text-text-main tracking-tight mb-1">
                      Review Changes
                    </h2>
                    <p className="text-sm text-text-muted max-w-[520px]">
                      {optimizeData.summary} — Review each change and accept or reject individual improvements.
                    </p>
                  </div>
                </div>
              </div>

              {/* Content: Changes / Original / Optimized */}
              <div className="px-5 pb-2">
                {viewMode === 'changes' && (
                  <div    className="flex flex-col gap-5">
                    {(optimizeData.sections || []).map((section, sIdx) => {
                      const sectionAccepted = (section.changes || []).filter(c => !!acceptedChanges[c.id]).length;
                      const sectionTotal = (section.changes || []).length;
                      const sectionProgress = sectionTotal > 0 ? (sectionAccepted / sectionTotal) * 100 : 0;
                      const sectionTypeColor = {
                        experience: 'bg-blue-500',
                        projects: 'bg-purple-500',
                        skills: 'bg-amber-500',
                        education: 'bg-teal-500',
                      }[section.sectionType] || 'bg-indigo-500';

                      return (
                        <div key={sIdx}  className="rounded-xl border border-border-color bg-white/30 dark:bg-slate-800/10 overflow-hidden">
                          {/* Section header with controls */}
                          <div className="px-4 py-2.5 flex items-center justify-between gap-3 border-b border-border-color bg-slate-50/30 dark:bg-slate-800/20">
                            <div className="flex items-center gap-2.5 min-w-0">
                              <div className={`w-1.5 h-5 rounded-full shrink-0 ${sectionTypeColor}`} />
                              <h3 className="text-sm font-bold text-text-main tracking-tight">{section.sectionName}</h3>
                              <span className="text-[10px] font-medium text-text-muted">{sectionTotal} change{sectionTotal !== 1 ? 's' : ''}</span>
                              <div className="w-16 h-1 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden hidden sm:block">
                                <div className={`h-full rounded-full transition-all duration-500 ${sectionProgress === 100 ? 'bg-emerald-500' : 'bg-blue-400'}`} style={{ width: `${sectionProgress}%` }} />
                              </div>
                              {sectionAccepted > 0 && (
                                <Badge variant="success" className="text-[9px] px-1.5 py-0 font-semibold">
                                  {sectionAccepted}/{sectionTotal}
                                </Badge>
                              )}
                            </div>
                            <div className="flex items-center gap-1.5 shrink-0">
                              <button
                                onClick={() => section.changes?.forEach(c => { if (!acceptedChanges[c.id]) toggleChange(c.id); })}
                                className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 bg-transparent border border-emerald-500/20 rounded-lg px-2 py-1 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-colors cursor-pointer"
                              >
                                Accept All
                              </button>
                              <button
                                onClick={() => section.changes?.forEach(c => { if (acceptedChanges[c.id]) toggleChange(c.id); })}
                                className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 bg-transparent border border-border-color rounded-lg px-2 py-1 hover:bg-slate-100 dark:hover:bg-slate-700/50 transition-colors cursor-pointer"
                              >
                                Reject All
                              </button>
                            </div>
                          </div>
                          <div className="p-3 flex flex-col gap-2">
                            {(section.changes || []).map((change, cIdx) => (
                              <DiffCard
                                key={change.id || `${sIdx}-${cIdx}`}
                                change={change}
                                accepted={!!acceptedChanges[change.id]}
                                onToggle={() => toggleChange(change.id)}
                              />
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
                {viewMode === 'original' && (
                  <div   className="py-2">
                    {originalProfile ? (
                      <ProfilePreview profile={originalProfile} label="Original" />
                    ) : (
                      <div className="flex items-center gap-2 text-text-muted text-sm py-8 justify-center">
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        Loading original profile…
                      </div>
                    )}
                  </div>
                )}
                {viewMode === 'optimized' && (
                  <div   className="py-2">
                    <ProfilePreview profile={optimizeData.optimizedProfile} label="Optimized" />
                  </div>
                )}
              </div>

              {/* Save success message */}
              {saveSuccess && (
                <div
                  
                  
                  className="mx-5 mb-2 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl px-4 py-3 flex items-center gap-2.5 border border-emerald-500/20"
                >
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <p className="text-sm text-emerald-700 dark:text-emerald-400 font-medium">{saveSuccess}</p>
                </div>
              )}

              {/* Sticky action buttons */}
              <div className="px-5 py-4 border-t border-border-color bg-gradient-to-t from-white/80 to-transparent dark:from-slate-900/80 sticky bottom-0">
                <div className="flex flex-wrap items-center gap-3 justify-between">
                  <p className="text-xs text-text-muted">
                    <span className="font-semibold text-text-main">{getAcceptedCount()}</span> of{' '}
                    <span className="font-semibold text-text-main">{getTotalCount()}</span> changes ready to apply
                  </p>
                  <div className="flex items-center gap-2">
                    <Button
                      onClick={handleSaveToProfile}
                      disabled={savingOptimized || getAcceptedCount() === 0}
                      variant="secondary"
                      size="sm"
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

                    {generatingLatex ? (
                      <Button disabled size="sm" variant="ghost" className="text-text-muted">
                        <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Preparing LaTeX…
                      </Button>
                    ) : generatedVersionId ? (
                      <Button onClick={handleViewLatex} size="sm" variant="default" className="gap-1.5">
                        <FileText className="w-4 h-4" />
                        View LaTeX
                      </Button>
                    ) : generatingLatexError ? (
                      <Button onClick={handleRetryLatex} size="sm" variant="ghost" className="text-amber-600 dark:text-amber-400 gap-1.5">
                        <RefreshCw className="w-4 h-4" />
                        Retry LaTeX
                      </Button>
                    ) : null}
                  </div>
                </div>
              </div>
            </Card>
          )}
        </>

        {/* ══════════════════════════════════════════════════════════════════════
            SECTION 2 — Optimize Resume for Company
        ══════════════════════════════════════════════════════════════════════ */}
        <div   >
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
                onKeyDown={(e) => {
                  if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
                    handleOptimize();
                  }
                }}
                placeholder={"Paste the full job description, role requirements, or company overview here…"}
                className="block min-h-[220px] w-full resize-y rounded-xl border border-border-color bg-bg-card px-4 py-3 text-sm leading-6 text-text-main outline-none transition placeholder:text-text-muted/60 focus:border-accent-500 focus:ring-4 focus:ring-accent-500/10"
              />
              <div className="flex justify-between mt-1.5">
                <p className={`text-xs ${jobDesc.length < 20 ? 'text-red-500' : 'text-text-muted'}`}>
                  {jobDesc.length} characters {jobDesc.length < 20 ? `(need ${20 - jobDesc.length} more)` : ''}
                </p>
                <div className="flex items-center gap-3">
                  {jobDesc.length === 0 && (
                    <button
                      onClick={() => { setJobDesc(EXAMPLE_JD); setOptimizeError(''); }}
                      className="text-xs text-indigo-500 dark:text-indigo-400 bg-transparent border-none cursor-pointer hover:underline font-medium"
                    >
                      Load Example JD
                    </button>
                  )}
                  {jobDesc.length > 0 && (
                    <button
                      onClick={() => setJobDesc('')}
                      className="text-xs text-text-muted bg-transparent border-none cursor-pointer hover:underline"
                    >
                      Clear
                    </button>
                  )}
                  {optimizeResult && (
                    <button
                      onClick={() => { setOptimizeResult(null); setOptimizeError(''); }}
                      className="text-xs text-text-muted bg-transparent border-none cursor-pointer hover:underline"
                    >
                      Clear Results
                    </button>
                  )}
                </div>
              </div>
            </div>

            {optimizeError && (
              <div role="alert" className="bg-red-50 dark:bg-red-900/10 rounded-xl p-3 px-4 flex items-center gap-2.5 mb-4">
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
            <>
              {optimizeResult && (
                <div key="optimize-results"   >

                  {/* Match score + summary */}
                  <div
                    
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
                  </div>

                  {/* ADD */}
                  {optimizeResult.add?.length > 0 && (
                    <div  className="mb-5">
                      <p className="text-xs font-bold text-green-500 uppercase tracking-widest mb-2.5 flex items-center gap-1.5">
                        <Plus className="w-3.5 h-3.5" />
                        Add These ({optimizeResult.add.length})
                      </p>
                      <div className="flex flex-col gap-2">
                        {optimizeResult.add.map((item, i) => (
                          <OptimizeCard key={i} item={item} type="add" />
                        ))}
                      </div>
                    </div>
                  )}

                  {/* REMOVE */}
                  {optimizeResult.remove?.length > 0 && (
                    <div  className="mb-5">
                      <p className="text-xs font-bold text-red-500 uppercase tracking-widest mb-2.5 flex items-center gap-1.5">
                        <Minus className="w-3.5 h-3.5" />
                        Remove These ({optimizeResult.remove.length})
                      </p>
                      <div className="flex flex-col gap-2">
                        {optimizeResult.remove.map((item, i) => (
                          <OptimizeCard key={i} item={item} type="remove" />
                        ))}
                      </div>
                    </div>
                  )}

                  {/* MODIFY */}
                  {optimizeResult.modify?.length > 0 && (
                    <div >
                      <p className="text-xs font-bold text-blue-500 uppercase tracking-widest mb-2.5 flex items-center gap-1.5">
                        <RefreshCw className="w-3.5 h-3.5" />
                        Modify These ({optimizeResult.modify.length})
                      </p>
                      <div className="flex flex-col gap-2">
                        {optimizeResult.modify.map((item, i) => (
                          <OptimizeCard key={i} item={item} type="modify" />
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Re-run */}
                  <div  className="mt-6 pt-5 border-t border-border-color flex justify-end">
                    <button
                      onClick={() => { setOptimizeResult(null); setJobDesc(''); }}
                      className="text-[13px] text-text-muted bg-transparent border-none cursor-pointer flex items-center gap-1.5 hover:underline"
                    >
                      <RefreshCw className="w-3.5 h-3.5" /> Try another job description
                    </button>
                  </div>
                </div>
              )}
            </>
          </Card>
        </div>

    </div>
  );
};

export default ResumeAI;
