import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Label } from 'recharts';
import AuthContext from '../context/AuthContext';
import { ThemeContext } from '../context/ThemeContext';
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
const StatCard = ({ label, value, caption, captionClass }) => (
  <div className="stat-card">
    <p className="text-[13px] text-gray-500 dark:text-on-dark-muted font-normal mb-2">{label}</p>
    <p className="stat-value">{value}</p>
    {caption && (
      <p className={`text-[12px] mt-1.5 font-medium ${captionClass || 'text-gray-500 dark:text-on-dark-muted'}`}>
        {caption}
      </p>
    )}
  </div>
);

const Dashboard = () => {
  const { user } = useContext(AuthContext);
  const { theme } = useContext(ThemeContext);
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
        const r = await axios.get(`${import.meta.env.VITE_API_URL}/resume`, cfg);
        setResumeData(r.data);
      } catch (e) {
        if (e.response?.status === 404) setResumeData(null);
      }
      const rolesRes = await axios.get(`${import.meta.env.VITE_API_URL}/analysis/roles`);
      if (rolesRes.data && rolesRes.data.length > 0) {
        setRoles(rolesRes.data);
      } else {
        // DB is empty (first launch or fresh deploy) — seed automatically
        await axios.post(`${import.meta.env.VITE_API_URL}/analysis/seed`);
        await axios.post(`${import.meta.env.VITE_API_URL}/roadmap/seed`);
        await axios.post(`${import.meta.env.VITE_API_URL}/projects/seed`);
        const seeded = await axios.get(`${import.meta.env.VITE_API_URL}/analysis/roles`);
        setRoles(seeded.data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const seedDatabase = async () => {
    try {
      await axios.post(`${import.meta.env.VITE_API_URL}/analysis/seed`);
      await axios.post(`${import.meta.env.VITE_API_URL}/roadmap/seed`);
      await axios.post(`${import.meta.env.VITE_API_URL}/projects/seed`);
      fetchDashboardData();
    } catch (e) { console.error(e); }
  };

  const handleAnalyze = async () => {
    if (!selectedRole) return;
    setLoading(true);
    try {
      const cfg = { headers: { Authorization: `Bearer ${user.token}` } };
      const analysisRes = await axios.post(
        `${import.meta.env.VITE_API_URL}/analysis/analyze`,
        { roleId: selectedRole },
        cfg,
      );
      setAnalysis(analysisRes.data);
      const { role: targetRoleName, analysis: { missingSkills } } = analysisRes.data;
      try {
        const roadmapRes = await axios.post(
          `${import.meta.env.VITE_API_URL}/roadmap/generate`,
          { roleName: targetRoleName, missingSkills },
          cfg,
        );
        setRoadmap(roadmapRes.data);
      } catch { setRoadmap(null); }
      try {
        const projectsRes = await axios.post(
          `${import.meta.env.VITE_API_URL}/projects/recommend`,
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
      <div className="min-h-[calc(100vh-54px)] flex items-center justify-center p-6 bg-surface dark:bg-dark-surface transition-colors duration-200">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center max-w-[480px]"
        >
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center mx-auto mb-7">
            <Zap className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-on-surface dark:text-on-dark tracking-tighter mb-3">
            Navigate your career with AI.
          </h1>
          <p className="text-[17px] text-gray-500 dark:text-on-dark-muted mb-9">
            Sign in to unlock skill gap analysis, personalized roadmaps, and job-fit scoring.
          </p>
          <div className="flex gap-3 justify-center flex-wrap">
            <Link to="/login" className="btn-apple px-8 py-3.5 text-[16px]">
              Sign In
            </Link>
            <Link to="/register" className="btn-apple-secondary px-8 py-3.5 text-[16px]">
              Create Account
            </Link>
          </div>
        </motion.div>
      </div>
    );
  }

  const chartData = analysis ? [
    { name: 'Matched', value: analysis.analysis.matchedSkills.length, color: theme === 'dark' ? '#32d74b' : '#34c759' },
    { name: 'Missing', value: analysis.analysis.missingSkills.length, color: theme === 'dark' ? '#ff453a' : '#ff3b30' },
  ] : [];

  const firstName = user?.name?.split(' ')[0] || 'there';
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';

  return (
    <div className="bg-surface dark:bg-dark-surface min-h-[calc(100vh-54px)] px-4 md:px-6 pt-10 pb-20 transition-colors duration-200">
      <div className="max-w-[1100px] mx-auto w-full">

        {/* ── Hero greeting ──────────────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="mb-12"
        >
          <h1 className="text-4xl md:text-5xl font-bold text-on-surface dark:text-on-dark tracking-tighter mb-3">
            {greeting}, {firstName}.
          </h1>
          <p className="text-[17px] text-gray-500 dark:text-on-dark-muted mb-6">
            {resumeData
              ? 'Your resume is loaded. Select a target role to run a full analysis.'
              : 'Upload your resume to get started with AI-powered career insights.'}
          </p>
          <div className="flex gap-3 flex-wrap">
            {!resumeData ? (
              <Link to="/upload" className="btn-apple px-6 py-3">
                Upload Resume
              </Link>
            ) : (
              <>
                {selectedRole && (
                  <button
                    onClick={handleAnalyze}
                    disabled={loading}
                    className="btn-apple px-6 py-3"
                  >
                    {loading ? (
                      <span className="flex items-center gap-2">
                        <span className="apple-spinner w-4 h-4" />
                        Analyzing…
                      </span>
                    ) : 'Analyze Profile'}
                  </button>
                )}
                <Link to="/upload" className="btn-apple-secondary px-6 py-3">
                  Re-upload Resume
                </Link>
                {roles.length === 0 && (
                  <button onClick={seedDatabase} className="btn-apple-secondary px-6 py-3">
                    <AlertTriangle className="w-4 h-4 mr-2" />
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
            className="bg-gradient-to-br from-primary-500 to-primary-600 rounded-[20px] p-8 md:p-11 flex flex-col md:flex-row items-start md:items-center justify-between gap-6"
          >
            <div>
              <p className="text-[11px] font-semibold text-white/70 uppercase tracking-[0.08em] mb-2.5">
                Step 1 — Get started
              </p>
              <h2 className="text-2xl md:text-[26px] font-bold text-white tracking-tight mb-2">
                Upload your resume
              </h2>
              <p className="text-[15px] text-white/80">
                Our AI extracts your skills and builds a personalized career roadmap.
              </p>
            </div>
            <Link
              to="/upload"
              className="bg-white/15 hover:bg-white/25 backdrop-blur-md border border-white/25 text-white text-[15px] font-medium px-7 py-3.5 rounded-full no-underline flex items-center gap-2 whitespace-nowrap transition-colors flex-shrink-0"
            >
              Get started <ChevronRight className="w-4 h-4" />
            </Link>
          </motion.div>
        )}

        {/* ── Resume loaded — role selector + skills ────────────────────────── */}
        {resumeData && (
          <motion.div variants={stagger} initial="hidden" animate="show">
            {/* Role selector */}
            <motion.div variants={fadeUp} className="mb-6">
              <div className="apple-card">
                <p className="section-title flex items-center mb-1.5">
                  <Briefcase className="w-[18px] h-[18px] mr-2 text-primary-500" />
                  Choose a target role
                </p>
                <p className="text-[14px] text-gray-500 dark:text-on-dark-muted mb-5">
                  We'll cross-reference your resume against real-world job requirements.
                </p>
                <div className="relative max-w-[400px]">
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
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                    <svg width="12" height="8" viewBox="0 0 12 8" fill="none">
                      <path d="M1 1l5 5 5-5" stroke="currentColor" className="text-gray-500 dark:text-on-dark-muted" strokeWidth="1.5" strokeLinecap="round" />
                    </svg>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Extracted skills */}
            <motion.div variants={fadeUp}>
              <div className="apple-card mb-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
                  <p className="section-title flex items-center mb-0">
                    <Zap className="w-[18px] h-[18px] mr-2 text-primary-500" />
                    Your skills
                  </p>
                  <span className="apple-pill self-start sm:self-auto">{resumeData.extractedSkills?.length || 0} detected</span>
                </div>
                {resumeData.extractedSkills?.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {resumeData.extractedSkills.map((s, i) => (
                      <span key={i} className="skill-tag">{s}</span>
                    ))}
                  </div>
                ) : (
                  <p className="text-[14px] text-[#aeaeb2] dark:text-on-dark-muted">No specific skills detected.</p>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* ── Analysis results ──────────────────────────────────────────────── */}
        <AnimatePresence>
          {analysis && (
            <motion.div
              key="analysis-results"
              variants={stagger}
              initial="hidden"
              animate="show"
              className="mt-2"
            >
              {/* ── Stats row ── */}
              <motion.div
                variants={fadeUp}
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6"
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
                  captionClass="text-error"
                />
                <StatCard
                  label="Match Rate"
                  value={`${Math.round(
                    (analysis.analysis.matchedSkills.length /
                      (analysis.analysis.matchedSkills.length + analysis.analysis.missingSkills.length)) *
                      100,
                  )}%`}
                  caption="skill alignment"
                  captionClass="text-success"
                />
              </motion.div>

              {/* ── Score chart + gap analysis ── */}
              <motion.div
                variants={fadeUp}
                className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6"
              >
                {/* Score chart */}
                <div className="apple-card flex flex-col items-center justify-center lg:col-span-1">
                  <p className="section-title self-start flex items-center w-full mb-5">
                    <Award className="w-[18px] h-[18px] mr-2 text-primary-500" />
                    Job Fit
                  </p>
                  <div className="w-full h-[180px]">
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
                                    className="text-[26px] font-bold fill-on-surface dark:fill-on-dark font-sans tracking-tight"
                                  >
                                    {matchPct}%
                                  </text>
                                  <text
                                    x={cx}
                                    y={cy + 16}
                                    textAnchor="middle"
                                    dominantBaseline="middle"
                                    className="text-[11px] font-medium fill-on-surface-variant dark:fill-dark-muted font-sans"
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
                            borderRadius: '12px',
                            border: 'none',
                            backgroundColor: theme === 'dark' ? '#2c2c2e' : '#ffffff',
                            color: theme === 'dark' ? '#ffffff' : '#1d1d1f',
                            boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                            fontSize: '13px',
                            fontWeight: 600,
                          }}
                          itemStyle={{ color: theme === 'dark' ? '#ffffff' : '#1d1d1f' }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="flex gap-4 mt-1">
                    <span className="text-[12px] text-success flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-success inline-block" />
                      Matched
                    </span>
                    <span className="text-[12px] text-error flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-error inline-block" />
                      Missing
                    </span>
                  </div>
                </div>

                {/* Skill gap detail */}
                <div className="apple-card lg:col-span-2">
                  <p className="section-title flex items-center">
                    <Target className="w-[18px] h-[18px] mr-2 text-primary-500" />
                    Skill Gap Analysis — {analysis.role}
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Matched */}
                    <div className="bg-[#f5f5f7] dark:bg-[#2c2c2e] rounded-2xl p-5 transition-colors duration-200">
                      <p className="text-[11px] font-bold text-[#248a3d] dark:text-[#32d74b] uppercase tracking-[0.07em] flex items-center gap-1.5 mb-3.5">
                        <CheckCircle className="w-3.5 h-3.5" />
                        Verified matches
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {analysis.analysis.matchedSkills.length > 0
                          ? analysis.analysis.matchedSkills.map(s => (
                              <span key={s} className="skill-tag-matched">{s}</span>
                            ))
                          : <span className="text-[13px] text-[#aeaeb2] dark:text-on-dark-muted">None found.</span>
                        }
                      </div>
                    </div>
                    {/* Missing */}
                    <div className="bg-[#f5f5f7] dark:bg-[#2c2c2e] rounded-2xl p-5 transition-colors duration-200">
                      <p className="text-[11px] font-bold text-error uppercase tracking-[0.07em] flex items-center gap-1.5 mb-3.5">
                        <XCircle className="w-3.5 h-3.5" />
                        Skill gaps
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {analysis.analysis.missingSkills.length > 0
                          ? analysis.analysis.missingSkills.map(s => (
                              <span key={s} className="skill-tag-missing">{s}</span>
                            ))
                          : <span className="text-[13px] text-success font-semibold">🎉 100% match!</span>
                        }
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* ── Roadmap ── */}
              <motion.div variants={fadeUp} className="gap-4">
                {roadmap && (
                  <div className="apple-card">
                    <p className="section-title flex items-center">
                      <Map className="w-[18px] h-[18px] mr-2 text-primary-500" />
                      Learning Roadmap
                    </p>
                    {/* Phase labels and time */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
                      {['beginner', 'intermediate', 'advanced'].map((level, i) => {
                        const phaseColors = ['#34c759', '#ff9500', '#0071e3'];
                        const phaseLabels = ['Foundation', 'Intermediate', 'Advanced'];
                        const phaseWeeks = ['Week 1–4', 'Week 5–10', 'Week 11–16'];
                        return (
                          <div key={level} className="bg-[#f5f5f7] dark:bg-[#2c2c2e] rounded-[14px] p-5 transition-colors duration-200">
                            {/* Phase header */}
                            <div className="flex items-center justify-between mb-3.5">
                              <div className="flex items-center gap-2">
                                <div
                                  className="w-[22px] h-[22px] rounded-full flex items-center justify-center text-[10px] font-bold text-white shrink-0"
                                  style={{ background: phaseColors[i] }}
                                >
                                  {i + 1}
                                </div>
                                <p className="text-[13px] font-semibold text-on-surface dark:text-on-dark">
                                  {phaseLabels[i]}
                                </p>
                              </div>
                              <span className="text-[10px] text-gray-500 dark:text-on-dark-muted bg-white dark:bg-dark-card px-2 py-0.5 rounded-full font-medium">
                                {phaseWeeks[i]}
                              </span>
                            </div>

                            {/* Skills list */}
                            <ul className="list-none p-0 m-0 flex flex-col gap-2.5">
                              {roadmap[level].map((item, idx) => (
                                <li key={idx}>
                                  <div className="flex items-start gap-2 mb-1">
                                    {item.isMissing ? (
                                      <div
                                        className="w-1.5 h-1.5 rounded-full mt-1.5 shrink-0"
                                        style={{ background: phaseColors[i] }}
                                      />
                                    ) : (
                                      <CheckCircle className="w-3.5 h-3.5 text-[#34c759] dark:text-[#32d74b] mt-[3px] shrink-0" />
                                    )}
                                    <div className="flex-1 min-w-0">
                                      <span className={`text-[13px] block ${item.isMissing ? 'text-on-surface dark:text-on-dark font-semibold' : 'text-[#aeaeb2] dark:text-[#636366] font-normal line-through'}`}>
                                        {item.skill}
                                      </span>
                                      {/* Time + Resource row */}
                                      {item.isMissing && (
                                        <div className="flex items-center gap-2 mt-1 flex-wrap">
                                          {item.timeEstimate && (
                                            <span className="text-[10px] text-gray-500 dark:text-on-dark-muted font-medium">⏱ {item.timeEstimate}</span>
                                          )}
                                          {item.resource && item.resource !== 'https://...' && (
                                            <a
                                              href={item.resource}
                                              target="_blank"
                                              rel="noopener noreferrer"
                                              className="text-[10px] text-primary-500 font-medium no-underline hover:underline"
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
