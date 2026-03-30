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
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ flexShrink: 0 }}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#f0f0f2" strokeWidth={8} />
      <circle
        cx={size / 2} cy={size / 2} r={r}
        fill="none" stroke={color} strokeWidth={8}
        strokeDasharray={circ} strokeDashoffset={prog}
        strokeLinecap="round"
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
        style={{ transition: 'stroke-dashoffset 0.8s ease' }}
      />
      <text
        x={size / 2} y={size / 2 + 1}
        textAnchor="middle" dominantBaseline="middle"
        style={{ fontSize: 18, fontWeight: 700, fill: '#1d1d1f', fontFamily: 'Inter, -apple-system, sans-serif' }}
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
      bg: 'rgba(255,59,48,0.06)',
      border: '#ff3b30',
      iconBg: 'rgba(255,59,48,0.12)',
      icon: <AlertCircle style={{ width: 16, height: 16, color: '#ff3b30' }} />,
      label: 'Critical',
      labelColor: '#ff3b30',
    },
    suggested: {
      bg: 'rgba(255,149,0,0.06)',
      border: '#ff9500',
      iconBg: 'rgba(255,149,0,0.12)',
      icon: <AlertTriangle style={{ width: 16, height: 16, color: '#ff9500' }} />,
      label: 'Suggested',
      labelColor: '#ff9500',
    },
    good: {
      bg: 'rgba(52,199,89,0.06)',
      border: '#34c759',
      iconBg: 'rgba(52,199,89,0.12)',
      icon: <CheckCircle style={{ width: 16, height: 16, color: '#34c759' }} />,
      label: 'Good',
      labelColor: '#34c759',
    },
  };

  const c = config[type];

  return (
    <div
      style={{
        background: c.bg,
        borderRadius: 14,
        border: `1px solid ${c.border}25`,
        borderLeft: `3px solid ${c.border}`,
        overflow: 'hidden',
        transition: 'box-shadow 0.2s',
      }}
    >
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          width: '100%',
          border: 'none',
          background: 'none',
          padding: '14px 18px',
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          cursor: 'pointer',
          textAlign: 'left',
        }}
      >
        <div
          style={{
            width: 30,
            height: 30,
            borderRadius: 8,
            background: c.iconBg,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          {c.icon}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ fontSize: 14, fontWeight: 600, color: '#1d1d1f', letterSpacing: '-0.01em' }}>
            {item.issue}
          </p>
        </div>
        <span style={{ fontSize: 10, fontWeight: 600, color: c.labelColor, background: `${c.border}15`, padding: '2px 8px', borderRadius: 980, flexShrink: 0 }}>
          {c.label}
        </span>
        {open
          ? <ChevronUp style={{ width: 16, height: 16, color: '#aeaeb2', flexShrink: 0 }} />
          : <ChevronDown style={{ width: 16, height: 16, color: '#aeaeb2', flexShrink: 0 }} />
        }
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            style={{ overflow: 'hidden' }}
          >
            <div style={{ padding: '0 18px 16px 60px' }}>
              <p style={{ fontSize: 13, color: '#1d1d1f', lineHeight: 1.6, marginBottom: item.example ? 10 : 0 }}>
                {item.detail}
              </p>
              {item.example && (
                <div
                  style={{
                    background: 'rgba(0,113,227,0.06)',
                    borderRadius: 10,
                    padding: '10px 14px',
                    borderLeft: '3px solid #0071e3',
                  }}
                >
                  <p style={{ fontSize: 11, fontWeight: 700, color: '#0071e3', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>
                    Example
                  </p>
                  <p style={{ fontSize: 13, color: '#1d1d1f', lineHeight: 1.5, fontStyle: 'italic' }}>
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
      bg: 'rgba(52,199,89,0.06)',
      border: '#34c759',
      icon: <Plus style={{ width: 14, height: 14, color: '#34c759' }} />,
      label: 'Add',
    },
    remove: {
      bg: 'rgba(255,59,48,0.06)',
      border: '#ff3b30',
      icon: <Minus style={{ width: 14, height: 14, color: '#ff3b30' }} />,
      label: 'Remove',
    },
    modify: {
      bg: 'rgba(0,113,227,0.06)',
      border: '#0071e3',
      icon: <RefreshCw style={{ width: 14, height: 14, color: '#0071e3' }} />,
      label: 'Modify',
    },
  };

  const c = config[type];

  return (
    <div
      style={{
        background: c.bg,
        borderRadius: 14,
        border: `1px solid ${c.border}20`,
        borderLeft: `3px solid ${c.border}`,
        overflow: 'hidden',
      }}
    >
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          width: '100%',
          border: 'none',
          background: 'none',
          padding: '13px 16px',
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          cursor: 'pointer',
          textAlign: 'left',
        }}
      >
        <div
          style={{
            width: 26,
            height: 26,
            borderRadius: 7,
            background: `${c.border}18`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          {c.icon}
        </div>
        <p style={{ flex: 1, fontSize: 14, fontWeight: 600, color: '#1d1d1f', letterSpacing: '-0.01em' }}>
          {item.item}
        </p>
        {open
          ? <ChevronUp style={{ width: 15, height: 15, color: '#aeaeb2' }} />
          : <ChevronDown style={{ width: 15, height: 15, color: '#aeaeb2' }} />
        }
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.18 }}
            style={{ overflow: 'hidden' }}
          >
            <div style={{ padding: '0 16px 14px 52px', display: 'flex', flexDirection: 'column', gap: 8 }}>
              {item.reason && (
                <p style={{ fontSize: 13, color: '#6e6e73', lineHeight: 1.6 }}>{item.reason}</p>
              )}
              {item.howTo && (
                <div style={{ background: '#ffffff', borderRadius: 10, padding: '10px 14px', border: '1px solid #e8e8ea' }}>
                  <p style={{ fontSize: 11, fontWeight: 700, color: '#6e6e73', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>
                    How to add
                  </p>
                  <p style={{ fontSize: 13, color: '#1d1d1f', lineHeight: 1.5 }}>{item.howTo}</p>
                </div>
              )}
              {item.before && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <div style={{ background: 'rgba(255,59,48,0.06)', borderRadius: 10, padding: '10px 14px', border: '1px solid rgba(255,59,48,0.15)' }}>
                    <p style={{ fontSize: 11, fontWeight: 700, color: '#ff3b30', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>Before</p>
                    <p style={{ fontSize: 13, color: '#1d1d1f', lineHeight: 1.5, fontStyle: 'italic' }}>"{item.before}"</p>
                  </div>
                  <div style={{ background: 'rgba(52,199,89,0.06)', borderRadius: 10, padding: '10px 14px', border: '1px solid rgba(52,199,89,0.15)' }}>
                    <p style={{ fontSize: 11, fontWeight: 700, color: '#34c759', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>After</p>
                    <p style={{ fontSize: 13, color: '#1d1d1f', lineHeight: 1.5, fontStyle: 'italic' }}>"{item.after}"</p>
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
  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14, padding: '48px 0' }}>
    <div
      style={{
        width: 44,
        height: 44,
        borderRadius: '50%',
        border: '3px solid #e8e8ea',
        borderTopColor: '#0071e3',
        animation: 'spin 0.8s linear infinite',
      }}
    />
    <p style={{ fontSize: 14, color: '#6e6e73' }}>{label}</p>
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
      const res = await axios.post('http://localhost:5000/api/resume/improve', {}, cfg);
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
      const res = await axios.post('http://localhost:5000/api/resume/optimize', { jobDescription: jobDesc }, cfg);
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
      <div style={{ minHeight: 'calc(100vh - 54px)', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f5f5f7', padding: 24 }}>
        <div style={{ background: '#fff', borderRadius: 20, padding: '48px 40px', textAlign: 'center', maxWidth: 400 }}>
          <AlertCircle style={{ width: 40, height: 40, color: '#ff3b30', margin: '0 auto 20px' }} />
          <h2 style={{ fontSize: 24, fontWeight: 700, color: '#1d1d1f', letterSpacing: '-0.02em', marginBottom: 8 }}>Sign in required</h2>
          <p style={{ color: '#6e6e73', fontSize: 15, marginBottom: 28 }}>Sign in and upload your resume to use AI Resume tools.</p>
          <Link to="/login" className="btn-apple" style={{ textDecoration: 'none', padding: '12px 28px' }}>Sign In</Link>
        </div>
      </div>
    );
  }

  return (
    <div style={{ background: '#f5f5f7', minHeight: 'calc(100vh - 54px)', padding: '56px 24px 80px' }}>
      <div style={{ maxWidth: 900, margin: '0 auto' }}>

        {/* ── Page header ────────────────────────────────────────────────────── */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} style={{ marginBottom: 48 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 10 }}>
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: 13,
                background: 'linear-gradient(135deg, #0071e3, #5856d6)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Sparkles style={{ width: 22, height: 22, color: '#fff' }} />
            </div>
            <div>
              <h1 style={{ fontSize: 36, fontWeight: 700, color: '#1d1d1f', letterSpacing: '-0.03em', lineHeight: 1.1 }}>
                Resume AI
              </h1>
              <p style={{ fontSize: 15, color: '#6e6e73', marginTop: 4 }}>
                Get expert-level feedback. Tailor your resume for any role.
              </p>
            </div>
          </div>
        </motion.div>

        {/* ══════════════════════════════════════════════════════════════════════
            SECTION 1 — Improve Your Resume
        ══════════════════════════════════════════════════════════════════════ */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.05 }}>
          <div style={{ background: '#ffffff', borderRadius: 20, padding: '36px 40px', marginBottom: 24 }}>

            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, marginBottom: 28, flexWrap: 'wrap' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#0071e3' }} />
                  <p style={{ fontSize: 11, fontWeight: 700, color: '#6e6e73', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                    Section 1
                  </p>
                </div>
                <h2 style={{ fontSize: 24, fontWeight: 700, color: '#1d1d1f', letterSpacing: '-0.02em', marginBottom: 6 }}>
                  Improve Your Resume
                </h2>
                <p style={{ fontSize: 14, color: '#6e6e73', maxWidth: 480 }}>
                  Get a comprehensive AI audit of your resume — covering structure, impact, ATS optimization, and skill gaps.
                </p>
              </div>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <span className="apple-pill-gray" style={{ fontSize: 11 }}>🔴 Critical fixes</span>
                <span className="apple-pill-gray" style={{ fontSize: 11 }}>🟡 Suggestions</span>
                <span className="apple-pill-gray" style={{ fontSize: 11 }}>🟢 Strengths</span>
              </div>
            </div>

            {/* CTA */}
            {!improveFeedback && !improveLoading && (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '32px 0 16px' }}>
                <div
                  style={{
                    width: 64,
                    height: 64,
                    borderRadius: 18,
                    background: 'linear-gradient(135deg, #f5f5f7, #ffffff)',
                    border: '1px solid #e8e8ea',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: 16,
                  }}
                >
                  <Sparkles style={{ width: 28, height: 28, color: '#0071e3' }} />
                </div>
                <p style={{ fontSize: 16, fontWeight: 600, color: '#1d1d1f', marginBottom: 6 }}>Ready to analyze your resume</p>
                <p style={{ fontSize: 14, color: '#6e6e73', marginBottom: 24, textAlign: 'center', maxWidth: 380 }}>
                  Our AI will review your resume like a senior recruiter at a top tech company.
                </p>
                <button onClick={handleImprove} className="btn-apple" style={{ padding: '13px 32px', fontSize: 15 }}>
                  Analyze My Resume
                  <ArrowRight style={{ width: 16, height: 16, marginLeft: 8 }} />
                </button>
              </div>
            )}

            {/* Loading */}
            {improveLoading && <Spinner label="Analyzing your resume with AI…" />}

            {/* Error */}
            {improveError && (
              <div style={{ background: 'rgba(255,59,48,0.07)', borderRadius: 12, padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 10 }}>
                <AlertCircle style={{ width: 16, height: 16, color: '#ff3b30', flexShrink: 0 }} />
                <p style={{ fontSize: 14, color: '#c0392b' }}>{improveError}</p>
              </div>
            )}

            {/* Results */}
            <AnimatePresence>
              {improveFeedback && (
                <motion.div variants={stagger} initial="hidden" animate="show">

                  {/* Score banner */}
                  <motion.div
                    variants={fadeUp}
                    style={{
                      background: 'linear-gradient(135deg, #f5f5f7 0%, #ffffff 100%)',
                      borderRadius: 16,
                      padding: '20px 24px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 20,
                      marginBottom: 28,
                      border: '1px solid #e8e8ea',
                    }}
                  >
                    <ScoreRing score={improveFeedback.score || 0} size={80} />
                    <div style={{ flex: 1 }}>
                      <p style={{ fontSize: 11, fontWeight: 700, color: '#6e6e73', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 6 }}>
                        Resume Score
                      </p>
                      <p style={{ fontSize: 18, fontWeight: 600, color: '#1d1d1f', lineHeight: 1.4, letterSpacing: '-0.01em', marginBottom: 8 }}>
                        {improveFeedback.summary}
                      </p>
                      <button
                        onClick={() => { setImproveFeedback(null); handleImprove(); }}
                        style={{ fontSize: 12, color: '#0071e3', background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center', gap: 4 }}
                      >
                        <RefreshCw style={{ width: 12, height: 12 }} /> Re-analyze
                      </button>
                    </div>
                  </motion.div>

                  {/* Critical */}
                  {improveFeedback.critical?.length > 0 && (
                    <motion.div variants={fadeUp} style={{ marginBottom: 20 }}>
                      <p style={{ fontSize: 12, fontWeight: 700, color: '#ff3b30', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
                        <AlertCircle style={{ width: 13, height: 13 }} />
                        Critical — Fix Before Applying ({improveFeedback.critical.length})
                      </p>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                        {improveFeedback.critical.map((item, i) => (
                          <FeedbackCard key={i} item={item} type="critical" />
                        ))}
                      </div>
                    </motion.div>
                  )}

                  {/* Suggested */}
                  {improveFeedback.suggested?.length > 0 && (
                    <motion.div variants={fadeUp} style={{ marginBottom: 20 }}>
                      <p style={{ fontSize: 12, fontWeight: 700, color: '#ff9500', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
                        <AlertTriangle style={{ width: 13, height: 13 }} />
                        Suggested Improvements ({improveFeedback.suggested.length})
                      </p>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                        {improveFeedback.suggested.map((item, i) => (
                          <FeedbackCard key={i} item={item} type="suggested" />
                        ))}
                      </div>
                    </motion.div>
                  )}

                  {/* Good */}
                  {improveFeedback.good?.length > 0 && (
                    <motion.div variants={fadeUp}>
                      <p style={{ fontSize: 12, fontWeight: 700, color: '#34c759', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
                        <CheckCircle style={{ width: 13, height: 13 }} />
                        What You're Doing Well ({improveFeedback.good.length})
                      </p>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
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
          <div style={{ background: '#ffffff', borderRadius: 20, padding: '36px 40px' }}>

            {/* Header */}
            <div style={{ marginBottom: 28 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#5856d6' }} />
                <p style={{ fontSize: 11, fontWeight: 700, color: '#6e6e73', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                  Section 2
                </p>
              </div>
              <h2 style={{ fontSize: 24, fontWeight: 700, color: '#1d1d1f', letterSpacing: '-0.02em', marginBottom: 6 }}>
                Optimize Resume for Company
              </h2>
              <p style={{ fontSize: 14, color: '#6e6e73', maxWidth: 520 }}>
                Paste a job description or company overview — our AI cross-references it with your resume and gives you a precise tailoring plan.
              </p>
            </div>

            {/* Input area */}
            <div style={{ marginBottom: 16 }}>
              <label style={{ fontSize: 13, fontWeight: 600, color: '#1d1d1f', display: 'block', marginBottom: 8 }}>
                <Building2 style={{ display: 'inline', width: 14, height: 14, marginRight: 6, verticalAlign: 'middle', color: '#5856d6' }} />
                Job Description / Company Requirements
              </label>
              <textarea
                value={jobDesc}
                onChange={e => { setJobDesc(e.target.value); setOptimizeError(''); }}
                placeholder="Paste the full job description, role requirements, or company overview here…&#10;&#10;Example: 'We are looking for a React Developer with experience in TypeScript, Next.js, AWS, and GraphQL. The ideal candidate has 2+ years of frontend experience and has shipped production-grade applications...'"
                style={{
                  width: '100%',
                  minHeight: 180,
                  background: '#f5f5f7',
                  border: '1px solid transparent',
                  borderRadius: 14,
                  padding: '16px 18px',
                  fontSize: 14,
                  fontFamily: '-apple-system, BlinkMacSystemFont, Inter, sans-serif',
                  color: '#1d1d1f',
                  lineHeight: 1.6,
                  resize: 'vertical',
                  outline: 'none',
                  transition: 'border-color 0.2s, background 0.2s',
                  boxSizing: 'border-box',
                }}
                onFocus={e => { e.target.style.borderColor = '#5856d6'; e.target.style.background = '#ffffff'; }}
                onBlur={e => { e.target.style.borderColor = 'transparent'; e.target.style.background = '#f5f5f7'; }}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6 }}>
                <p style={{ fontSize: 12, color: jobDesc.length < 20 ? '#ff3b30' : '#aeaeb2' }}>
                  {jobDesc.length} characters {jobDesc.length < 20 ? `(need ${20 - jobDesc.length} more)` : ''}
                </p>
                {jobDesc.length > 0 && (
                  <button
                    onClick={() => { setJobDesc(''); setOptimizeResult(null); setOptimizeError(''); }}
                    style={{ fontSize: 12, color: '#6e6e73', background: 'none', border: 'none', cursor: 'pointer' }}
                  >
                    Clear
                  </button>
                )}
              </div>
            </div>

            {optimizeError && (
              <div style={{ background: 'rgba(255,59,48,0.07)', borderRadius: 12, padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                <AlertCircle style={{ width: 15, height: 15, color: '#ff3b30', flexShrink: 0 }} />
                <p style={{ fontSize: 13, color: '#c0392b' }}>{optimizeError}</p>
              </div>
            )}

            <button
              onClick={handleOptimize}
              disabled={optimizeLoading || jobDesc.trim().length < 20}
              className="btn-apple-rect"
              style={{ marginBottom: optimizeResult || optimizeLoading ? 32 : 0 }}
            >
              {optimizeLoading
                ? <span style={{ display: 'flex', alignItems: 'center', gap: 10, justifyContent: 'center' }}>
                    <span className="apple-spinner" />
                    Analyzing & optimizing…
                  </span>
                : <>
                    <Zap style={{ width: 16, height: 16, marginRight: 8 }} />
                    Analyze &amp; Optimize
                  </>
              }
            </button>

            {/* Loading */}
            {optimizeLoading && <Spinner label="Cross-referencing your resume with the job description…" />}

            {/* Results */}
            <AnimatePresence>
              {optimizeResult && (
                <motion.div variants={stagger} initial="hidden" animate="show">

                  {/* Match score + summary */}
                  <motion.div
                    variants={fadeUp}
                    style={{
                      background: '#f5f5f7',
                      borderRadius: 16,
                      padding: '20px 24px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 20,
                      marginBottom: 28,
                    }}
                  >
                    <ScoreRing score={optimizeResult.matchScore || 0} size={80} />
                    <div style={{ flex: 1 }}>
                      <p style={{ fontSize: 11, fontWeight: 700, color: '#6e6e73', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 6 }}>
                        Current Match Score
                      </p>
                      <p style={{ fontSize: 16, fontWeight: 600, color: '#1d1d1f', lineHeight: 1.4, letterSpacing: '-0.01em', marginBottom: 10 }}>
                        {optimizeResult.companySummary}
                      </p>
                      {/* ATS Keywords */}
                      {optimizeResult.keywords?.length > 0 && (
                        <div>
                          <p style={{ fontSize: 11, fontWeight: 600, color: '#6e6e73', marginBottom: 6 }}>Missing ATS keywords:</p>
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                            {optimizeResult.keywords.map((kw, i) => (
                              <span key={i} className="apple-pill-error" style={{ fontSize: 11 }}>{kw}</span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </motion.div>

                  {/* ADD */}
                  {optimizeResult.add?.length > 0 && (
                    <motion.div variants={fadeUp} style={{ marginBottom: 20 }}>
                      <p style={{ fontSize: 12, fontWeight: 700, color: '#34c759', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
                        <Plus style={{ width: 13, height: 13 }} />
                        Add These ({optimizeResult.add.length})
                      </p>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                        {optimizeResult.add.map((item, i) => (
                          <OptimizeCard key={i} item={item} type="add" />
                        ))}
                      </div>
                    </motion.div>
                  )}

                  {/* REMOVE */}
                  {optimizeResult.remove?.length > 0 && (
                    <motion.div variants={fadeUp} style={{ marginBottom: 20 }}>
                      <p style={{ fontSize: 12, fontWeight: 700, color: '#ff3b30', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
                        <Minus style={{ width: 13, height: 13 }} />
                        Remove These ({optimizeResult.remove.length})
                      </p>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                        {optimizeResult.remove.map((item, i) => (
                          <OptimizeCard key={i} item={item} type="remove" />
                        ))}
                      </div>
                    </motion.div>
                  )}

                  {/* MODIFY */}
                  {optimizeResult.modify?.length > 0 && (
                    <motion.div variants={fadeUp}>
                      <p style={{ fontSize: 12, fontWeight: 700, color: '#0071e3', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
                        <RefreshCw style={{ width: 13, height: 13 }} />
                        Modify These ({optimizeResult.modify.length})
                      </p>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                        {optimizeResult.modify.map((item, i) => (
                          <OptimizeCard key={i} item={item} type="modify" />
                        ))}
                      </div>
                    </motion.div>
                  )}

                  {/* Re-run */}
                  <motion.div variants={fadeUp} style={{ marginTop: 24, paddingTop: 20, borderTop: '1px solid #e8e8ea', display: 'flex', justifyContent: 'flex-end' }}>
                    <button
                      onClick={() => { setOptimizeResult(null); setJobDesc(''); }}
                      style={{ fontSize: 13, color: '#6e6e73', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}
                    >
                      <RefreshCw style={{ width: 13, height: 13 }} /> Try another job description
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
