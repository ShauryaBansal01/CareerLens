import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Label } from 'recharts';
import AuthContext from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CheckCircle, XCircle, Briefcase, Map,
  AlertTriangle, Target, Zap, TrendingUp, Award, UploadCloud,
  ChevronRight,
} from 'lucide-react';

// ── Accent bar colors for insights ────────────────────────────────────────────
const INSIGHT_COLORS = ['#0071e3', '#34c759', '#ff9500', '#ff3b30', '#5856d6'];

// ── Stagger variants ───────────────────────────────────────────────────────────
const stagger = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.07 } },
};
const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.3, ease: 'easeOut' } },
};

// ── Helpers ────────────────────────────────────────────────────────────────────
const StatCard = ({ label, value, caption, captionColor }) => (
  <div className="stat-card">
    <p style={{ fontSize: 13, color: '#6e6e73', fontWeight: 400, marginBottom: 8 }}>{label}</p>
    <p className="stat-value">{value}</p>
    {caption && (
      <p style={{ fontSize: 12, color: captionColor || '#6e6e73', marginTop: 6, fontWeight: 500 }}>
        {caption}
      </p>
    )}
  </div>
);

const Dashboard = () => {
  const { user } = useContext(AuthContext);
  const [resumeData, setResumeData]   = useState(null);
  const [roles, setRoles]             = useState([]);
  const [selectedRole, setSelectedRole] = useState('');
  const [analysis, setAnalysis]       = useState(null);
  const [roadmap, setRoadmap]         = useState(null);
  const [projects, setProjects]       = useState([]);
  const [loading, setLoading]         = useState(false);

  useEffect(() => {
    if (user) fetchDashboardData();
  }, [user]);

  const fetchDashboardData = async () => {
    try {
      const cfg = { headers: { Authorization: `Bearer ${user.token}` } };
      try {
        const r = await axios.get('http://localhost:5000/api/resume', cfg);
        setResumeData(r.data);
      } catch (e) {
        if (e.response?.status === 404) setResumeData(null);
      }
      const rolesRes = await axios.get('http://localhost:5000/api/analysis/roles');
      if (rolesRes.data && rolesRes.data.length > 0) {
        setRoles(rolesRes.data);
      } else {
        // DB is empty (first launch or fresh deploy) — seed automatically
        await axios.post('http://localhost:5000/api/analysis/seed');
        await axios.post('http://localhost:5000/api/roadmap/seed');
        await axios.post('http://localhost:5000/api/projects/seed');
        const seeded = await axios.get('http://localhost:5000/api/analysis/roles');
        setRoles(seeded.data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const seedDatabase = async () => {
    try {
      await axios.post('http://localhost:5000/api/analysis/seed');
      await axios.post('http://localhost:5000/api/roadmap/seed');
      await axios.post('http://localhost:5000/api/projects/seed');
      fetchDashboardData();
    } catch (e) { console.error(e); }
  };

  const handleAnalyze = async () => {
    if (!selectedRole) return;
    setLoading(true);
    try {
      const cfg = { headers: { Authorization: `Bearer ${user.token}` } };
      const analysisRes = await axios.post(
        'http://localhost:5000/api/analysis/analyze',
        { roleId: selectedRole },
        cfg,
      );
      setAnalysis(analysisRes.data);
      const { role: targetRoleName, analysis: { missingSkills } } = analysisRes.data;
      try {
        const roadmapRes = await axios.post(
          'http://localhost:5000/api/roadmap/generate',
          { roleName: targetRoleName, missingSkills },
          cfg,
        );
        setRoadmap(roadmapRes.data);
      } catch { setRoadmap(null); }
      try {
        const projectsRes = await axios.post(
          'http://localhost:5000/api/projects/recommend',
          { missingSkills },
          cfg,
        );
        setProjects(projectsRes.data);
      } catch { setProjects([]); }
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  // ── Not authenticated ──────────────────────────────────────────────────────
  if (!user) {
    return (
      <div
        style={{
          minHeight: 'calc(100vh - 54px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 24,
          background: '#f5f5f7',
        }}
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ textAlign: 'center', maxWidth: 480 }}
        >
          <div
            style={{
              width: 64,
              height: 64,
              borderRadius: 18,
              background: 'linear-gradient(135deg, #0071e3, #0059b5)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 28px',
            }}
          >
            <Zap style={{ width: 32, height: 32, color: '#fff' }} />
          </div>
          <h1
            style={{
              fontSize: 40,
              fontWeight: 700,
              color: '#1d1d1f',
              letterSpacing: '-0.03em',
              marginBottom: 12,
            }}
          >
            Navigate your career with AI.
          </h1>
          <p style={{ fontSize: 17, color: '#6e6e73', marginBottom: 36 }}>
            Sign in to unlock skill gap analysis, personalized roadmaps, and job-fit scoring.
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/login" className="btn-apple" style={{ textDecoration: 'none', padding: '13px 32px', fontSize: 16 }}>
              Sign In
            </Link>
            <Link to="/register" className="btn-apple-secondary" style={{ textDecoration: 'none', padding: '13px 32px', fontSize: 16 }}>
              Create Account
            </Link>
          </div>
        </motion.div>
      </div>
    );
  }

  const chartData = analysis ? [
    { name: 'Matched', value: analysis.analysis.matchedSkills.length, color: '#34c759' },
    { name: 'Missing', value: analysis.analysis.missingSkills.length, color: '#ff3b30' },
  ] : [];

  const firstName = user?.name?.split(' ')[0] || 'there';
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';

  return (
    <div
      style={{
        background: '#f5f5f7',
        minHeight: 'calc(100vh - 54px)',
        padding: '56px 24px 80px',
      }}
    >
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>

        {/* ── Hero greeting ──────────────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          style={{ marginBottom: 48 }}
        >
          <h1
            style={{
              fontSize: 44,
              fontWeight: 700,
              color: '#1d1d1f',
              letterSpacing: '-0.03em',
              marginBottom: 10,
            }}
          >
            {greeting}, {firstName}.
          </h1>
          <p style={{ fontSize: 17, color: '#6e6e73', marginBottom: 24 }}>
            {resumeData
              ? 'Your resume is loaded. Select a target role to run a full analysis.'
              : 'Upload your resume to get started with AI-powered career insights.'}
          </p>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            {!resumeData ? (
              <Link to="/upload" className="btn-apple" style={{ textDecoration: 'none', padding: '11px 24px' }}>
                Upload Resume
              </Link>
            ) : (
              <>
                {selectedRole && (
                  <button
                    onClick={handleAnalyze}
                    disabled={loading}
                    className="btn-apple"
                    style={{ padding: '11px 24px', cursor: loading ? 'wait' : 'pointer' }}
                  >
                    {loading ? (
                      <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span className="apple-spinner" style={{ width: 16, height: 16 }} />
                        Analyzing…
                      </span>
                    ) : 'Analyze Profile'}
                  </button>
                )}
                <Link to="/upload" className="btn-apple-secondary" style={{ textDecoration: 'none', padding: '11px 24px' }}>
                  Re-upload Resume
                </Link>
                {roles.length === 0 && (
                  <button onClick={seedDatabase} className="btn-apple-secondary" style={{ padding: '11px 24px' }}>
                    <AlertTriangle style={{ width: 14, height: 14, marginRight: 8 }} />
                    Populate Data
                  </button>
                )}
              </>
            )}
          </div>
        </motion.div>

        {/* ── No resume — CTA banner ────────────────────────────────────────── */}
        {!resumeData && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            style={{
              background: 'linear-gradient(135deg, #0071e3 0%, #0059b5 100%)',
              borderRadius: 20,
              padding: '40px 44px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 24,
              flexWrap: 'wrap',
            }}
          >
            <div>
              <p
                style={{
                  fontSize: 11,
                  fontWeight: 600,
                  color: 'rgba(255,255,255,0.7)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                  marginBottom: 10,
                }}
              >
                Step 1 — Get started
              </p>
              <h2
                style={{
                  fontSize: 26,
                  fontWeight: 700,
                  color: '#ffffff',
                  letterSpacing: '-0.02em',
                  marginBottom: 8,
                }}
              >
                Upload your resume
              </h2>
              <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.8)' }}>
                Our AI extracts your skills and builds a personalized career roadmap.
              </p>
            </div>
            <Link
              to="/upload"
              style={{
                background: 'rgba(255,255,255,0.15)',
                backdropFilter: 'blur(8px)',
                border: '1px solid rgba(255,255,255,0.25)',
                color: '#ffffff',
                fontSize: 15,
                fontWeight: 500,
                padding: '13px 28px',
                borderRadius: 980,
                textDecoration: 'none',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                whiteSpace: 'nowrap',
                transition: 'background 0.2s',
                flexShrink: 0,
              }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.25)'}
              onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.15)'}
            >
              Get started <ChevronRight style={{ width: 16, height: 16 }} />
            </Link>
          </motion.div>
        )}

        {/* ── Resume loaded — role selector + skills ────────────────────────── */}
        {resumeData && (
          <motion.div
            variants={stagger}
            initial="hidden"
            animate="show"
          >
            {/* Role selector */}
            <motion.div variants={fadeUp} style={{ marginBottom: 24 }}>
              <div
                style={{
                  background: '#ffffff',
                  borderRadius: 18,
                  padding: '28px 32px',
                }}
              >
                <p className="section-title" style={{ marginBottom: 6 }}>
                  <Briefcase style={{ display: 'inline', width: 18, height: 18, marginRight: 8, verticalAlign: 'middle', color: '#0071e3' }} />
                  Choose a target role
                </p>
                <p style={{ fontSize: 14, color: '#6e6e73', marginBottom: 20 }}>
                  We'll cross-reference your resume against real-world job requirements.
                </p>
                <div style={{ position: 'relative', maxWidth: 400 }}>
                  <select
                    value={selectedRole}
                    onChange={e => setSelectedRole(e.target.value)}
                    className="apple-select"
                  >
                    <option value="" disabled>Select a role…</option>
                    {roles.map(r => (
                      <option key={r._id} value={r._id}>{r.roleName}</option>
                    ))}
                  </select>
                  <div
                    style={{
                      position: 'absolute',
                      right: 16,
                      top: '50%',
                      transform: 'translateY(-50%)',
                      pointerEvents: 'none',
                    }}
                  >
                    <svg width="12" height="8" viewBox="0 0 12 8" fill="none">
                      <path d="M1 1l5 5 5-5" stroke="#6e6e73" strokeWidth="1.5" strokeLinecap="round" />
                    </svg>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Extracted skills */}
            <motion.div variants={fadeUp}>
              <div
                style={{
                  background: '#ffffff',
                  borderRadius: 18,
                  padding: '28px 32px',
                  marginBottom: 24,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
                  <p className="section-title" style={{ marginBottom: 0 }}>
                    <Zap style={{ display: 'inline', width: 18, height: 18, marginRight: 8, verticalAlign: 'middle', color: '#0071e3' }} />
                    Your skills
                  </p>
                  <span className="apple-pill">{resumeData.extractedSkills?.length || 0} detected</span>
                </div>
                {resumeData.extractedSkills?.length > 0 ? (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                    {resumeData.extractedSkills.map((s, i) => (
                      <span key={i} className="skill-tag">{s}</span>
                    ))}
                  </div>
                ) : (
                  <p style={{ fontSize: 14, color: '#aeaeb2' }}>No specific skills detected.</p>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* ── Analysis results ──────────────────────────────────────────────── */}
        <AnimatePresence>
          {analysis && (
            <motion.div
              variants={stagger}
              initial="hidden"
              animate="show"
              style={{ marginTop: 8 }}
            >
              {/* ── Stats row ── */}
              <motion.div
                variants={fadeUp}
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                  gap: 16,
                  marginBottom: 24,
                }}
              >
                <StatCard
                  label="Job Readiness Score"
                  value={analysis.scoring?.totalJobReadinessScore}
                  caption="out of 100"
                />
                <StatCard
                  label="Skills Matched"
                  value={analysis.analysis.matchedSkills.length}
                  caption={`of ${analysis.analysis.matchedSkills.length + analysis.analysis.missingSkills.length} required`}
                />
                <StatCard
                  label="Skill Gaps"
                  value={analysis.analysis.missingSkills.length}
                  caption="to close for this role"
                  captionColor="#ff3b30"
                />
                <StatCard
                  label="Match Rate"
                  value={`${Math.round(
                    (analysis.analysis.matchedSkills.length /
                      (analysis.analysis.matchedSkills.length + analysis.analysis.missingSkills.length)) *
                      100,
                  )}%`}
                  caption="skill alignment"
                  captionColor="#34c759"
                />
              </motion.div>

              {/* ── Score chart + gap analysis ── */}
              <motion.div
                variants={fadeUp}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 2fr',
                  gap: 16,
                  marginBottom: 24,
                }}
              >
                {/* Score chart */}
                <div
                  style={{
                    background: '#ffffff',
                    borderRadius: 18,
                    padding: '28px 32px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <p className="section-title" style={{ alignSelf: 'flex-start', marginBottom: 20 }}>
                    <Award style={{ display: 'inline', width: 18, height: 18, marginRight: 8, verticalAlign: 'middle', color: '#0071e3' }} />
                    Job Fit
                  </p>
                  <div style={{ width: '100%', height: 180 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={chartData}
                          innerRadius={52}
                          outerRadius={72}
                          paddingAngle={4}
                          dataKey="value"
                          stroke="none"
                          cornerRadius={5}
                          startAngle={90}
                          endAngle={-270}
                        >
                          {chartData.map((entry, i) => (
                            <Cell key={i} fill={entry.color} />
                          ))}
                          <Label
                            content={({ viewBox }) => {
                              const { cx, cy } = viewBox;
                              const matchPct = Math.round(
                                (analysis.analysis.matchedSkills.length /
                                  (analysis.analysis.matchedSkills.length + analysis.analysis.missingSkills.length)) * 100
                              );
                              return (
                                <g>
                                  <text
                                    x={cx}
                                    y={cy - 6}
                                    textAnchor="middle"
                                    dominantBaseline="middle"
                                    style={{ fontSize: 26, fontWeight: 700, fill: '#1d1d1f', fontFamily: 'Inter, -apple-system, sans-serif', letterSpacing: '-0.03em' }}
                                  >
                                    {matchPct}%
                                  </text>
                                  <text
                                    x={cx}
                                    y={cy + 16}
                                    textAnchor="middle"
                                    dominantBaseline="middle"
                                    style={{ fontSize: 11, fontWeight: 500, fill: '#6e6e73', fontFamily: 'Inter, -apple-system, sans-serif' }}
                                  >
                                    match
                                  </text>
                                </g>
                              );
                            }}
                          />
                        </Pie>
                        <Tooltip
                          contentStyle={{
                            borderRadius: 12,
                            border: 'none',
                            boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                            fontSize: 13,
                            fontWeight: 600,
                          }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div style={{ display: 'flex', gap: 16, marginTop: 4 }}>
                    <span style={{ fontSize: 12, color: '#248a3d', display: 'flex', alignItems: 'center', gap: 5 }}>
                      <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#34c759', display: 'inline-block' }} />
                      Matched
                    </span>
                    <span style={{ fontSize: 12, color: '#c0392b', display: 'flex', alignItems: 'center', gap: 5 }}>
                      <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#ff3b30', display: 'inline-block' }} />
                      Missing
                    </span>
                  </div>
                </div>

                {/* Skill gap detail */}
                <div style={{ background: '#ffffff', borderRadius: 18, padding: '28px 32px' }}>
                  <p className="section-title">
                    <Target style={{ display: 'inline', width: 18, height: 18, marginRight: 8, verticalAlign: 'middle', color: '#0071e3' }} />
                    Skill Gap Analysis — {analysis.role}
                  </p>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                    {/* Matched */}
                    <div style={{ background: '#f5f5f7', borderRadius: 14, padding: '20px 22px' }}>
                      <p
                        style={{
                          fontSize: 11,
                          fontWeight: 700,
                          color: '#248a3d',
                          textTransform: 'uppercase',
                          letterSpacing: '0.07em',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 6,
                          marginBottom: 14,
                        }}
                      >
                        <CheckCircle style={{ width: 14, height: 14 }} />
                        Verified matches
                      </p>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                        {analysis.analysis.matchedSkills.length > 0
                          ? analysis.analysis.matchedSkills.map(s => (
                              <span key={s} className="skill-tag-matched">{s}</span>
                            ))
                          : <span style={{ fontSize: 13, color: '#aeaeb2' }}>None found.</span>
                        }
                      </div>
                    </div>
                    {/* Missing */}
                    <div style={{ background: '#f5f5f7', borderRadius: 14, padding: '20px 22px' }}>
                      <p
                        style={{
                          fontSize: 11,
                          fontWeight: 700,
                          color: '#c0392b',
                          textTransform: 'uppercase',
                          letterSpacing: '0.07em',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 6,
                          marginBottom: 14,
                        }}
                      >
                        <XCircle style={{ width: 14, height: 14 }} />
                        Skill gaps
                      </p>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                        {analysis.analysis.missingSkills.length > 0
                          ? analysis.analysis.missingSkills.map(s => (
                              <span key={s} className="skill-tag-missing">{s}</span>
                            ))
                          : <span style={{ fontSize: 13, color: '#34c759', fontWeight: 600 }}>🎉 100% match!</span>
                        }
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* ── Roadmap ── */}
              <motion.div
                variants={fadeUp}
                style={{ gap: 16 }}
              >
                {/* Roadmap */}
                {roadmap && (
                  <div style={{ background: '#ffffff', borderRadius: 18, padding: '28px 32px' }}>
                    <p className="section-title">
                      <Map style={{ display: 'inline', width: 18, height: 18, marginRight: 8, verticalAlign: 'middle', color: '#0071e3' }} />
                      Learning Roadmap
                    </p>
                    {/* Phase labels and time */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14 }}>
                      {['beginner', 'intermediate', 'advanced'].map((level, i) => {
                        const phaseColors = ['#34c759', '#ff9500', '#0071e3'];
                        const phaseLabels = ['Foundation', 'Intermediate', 'Advanced'];
                        const phaseWeeks = ['Week 1–4', 'Week 5–10', 'Week 11–16'];
                        return (
                          <div
                            key={level}
                            style={{
                              background: '#f5f5f7',
                              borderRadius: 14,
                              padding: '20px 18px',
                            }}
                          >
                            {/* Phase header */}
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                <div
                                  style={{
                                    width: 22,
                                    height: 22,
                                    borderRadius: '50%',
                                    background: phaseColors[i],
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: 10,
                                    fontWeight: 700,
                                    color: '#ffffff',
                                    flexShrink: 0,
                                  }}
                                >
                                  {i + 1}
                                </div>
                                <p style={{ fontSize: 13, fontWeight: 600, color: '#1d1d1f' }}>
                                  {phaseLabels[i]}
                                </p>
                              </div>
                              <span style={{ fontSize: 10, color: '#6e6e73', background: '#ffffff', padding: '2px 8px', borderRadius: 980, fontWeight: 500 }}>
                                {phaseWeeks[i]}
                              </span>
                            </div>

                            {/* Skills list */}
                            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 10 }}>
                              {roadmap[level].map((item, idx) => (
                                <li key={idx}>
                                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8, marginBottom: 3 }}>
                                    {item.isMissing ? (
                                      <div
                                        style={{
                                          width: 6,
                                          height: 6,
                                          borderRadius: '50%',
                                          background: phaseColors[i],
                                          marginTop: 5,
                                          flexShrink: 0,
                                        }}
                                      />
                                    ) : (
                                      <CheckCircle
                                        style={{ width: 14, height: 14, color: '#34c759', marginTop: 1, flexShrink: 0 }}
                                      />
                                    )}
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                      <span
                                        style={{
                                          fontSize: 13,
                                          color: item.isMissing ? '#1d1d1f' : '#aeaeb2',
                                          fontWeight: item.isMissing ? 600 : 400,
                                          textDecoration: item.isMissing ? 'none' : 'line-through',
                                          display: 'block',
                                        }}
                                      >
                                        {item.skill}
                                      </span>
                                      {/* Time + Resource row */}
                                      {item.isMissing && (
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 3, flexWrap: 'wrap' }}>
                                          {item.timeEstimate && (
                                            <span style={{ fontSize: 10, color: '#6e6e73', fontWeight: 500 }}>⏱ {item.timeEstimate}</span>
                                          )}
                                          {item.resource && item.resource !== 'https://...' && (
                                            <a
                                              href={item.resource}
                                              target="_blank"
                                              rel="noopener noreferrer"
                                              style={{ fontSize: 10, color: '#0071e3', fontWeight: 500, textDecoration: 'none' }}
                                            >
                                              Learn →
                                            </a>
                                          )}
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                </li>
                              ))}
                            </ul>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
};

export default Dashboard;
