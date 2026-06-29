import { useContext, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';
import {
  AlertCircle,
  ArrowRight,
  Bot,
  Code2,
  FileText,
  Gauge,
  KeyRound,
  Map,
  PenTool,
  Plus,
  Rocket,
  Settings,
  Sparkles,
  Target,
  UploadCloud,
  UserRound,
} from 'lucide-react';
import {
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';
import AuthContext from '../context/AuthContext';
import { Button } from '../components/ui/Button';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const fadeUp = {
  hidden: { opacity: 0, y: 14 },
  show: { opacity: 1, y: 0, transition: { duration: 0.28, ease: 'easeOut' } },
};

const stagger = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.05 } },
};

const implementedFeatures = [
  {
    icon: UploadCloud,
    title: 'Resume Upload & Parsing',
    copy: 'Upload a PDF resume. The backend extracts skills, education, experience, profile data, and base LaTeX.',
  },
  {
    icon: Gauge,
    title: 'Resume Analyzer',
    copy: 'Generate AI resume feedback with score, critical fixes, suggestions, and strengths.',
  },
  {
    icon: Target,
    title: 'Job Description Tailoring',
    copy: 'Paste a JD to get match score, missing keywords, and concrete add/remove/modify guidance.',
  },
  {
    icon: Code2,
    title: 'LaTeX Resume Builder',
    copy: 'Generate, edit, save, tailor, and manage resume versions from the backend.',
  },
  {
    icon: PenTool,
    title: 'Cover Letter Generator',
    copy: 'Generate cover letters from your saved profile or resume and a target job description.',
  },
  {
    icon: Map,
    title: 'Role Gap Roadmap',
    copy: 'Analyze a target role, then generate learning roadmap and project recommendations.',
  },
  {
    icon: UserRound,
    title: 'Profile Management',
    copy: 'Edit professional basics, skills, experience, education, and projects.',
  },
  {
    icon: KeyRound,
    title: 'Bring Your Own AI Key',
    copy: 'Save and validate supported AI provider keys for AI-powered endpoints.',
  },
];

const Panel = ({ children, className = '' }) => (
  <div className={`rounded-2xl border border-slate-200 bg-white shadow-[0_18px_50px_rgba(15,23,42,0.06)] ${className}`}>
    {children}
  </div>
);

const EmptyState = ({ title, copy, action }) => (
  <Panel className="p-8 text-center">
    <div className="mx-auto mb-4 grid h-12 w-12 place-items-center rounded-2xl bg-[#6C5CE7]/10 text-[#6C5CE7]">
      <UploadCloud className="h-5 w-5" />
    </div>
    <h2 className="text-xl font-extrabold text-slate-950">{title}</h2>
    <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-slate-500">{copy}</p>
    {action}
  </Panel>
);

const Landing = () => (
  <main className="bg-[#FAFBFD]">
    <section className="border-b border-slate-200 bg-[radial-gradient(circle_at_50%_18%,rgba(108,92,231,0.14),transparent_32%),linear-gradient(180deg,#fff_0%,#FAFBFD_82%)]">
      <div className="mx-auto max-w-[1180px] px-4 py-16 text-center sm:px-6 lg:py-20">
        <motion.div variants={stagger} initial="hidden" animate="show">
          <motion.div variants={fadeUp} className="mx-auto inline-flex items-center gap-2 rounded-full border border-[#6C5CE7]/15 bg-[#6C5CE7]/10 px-4 py-2 text-xs font-bold text-[#5144d8]">
            <Sparkles className="h-3.5 w-3.5" />
            AI career tools backed by implemented APIs
          </motion.div>
          <motion.h1 variants={fadeUp} className="mx-auto mt-8 max-w-[780px] text-4xl font-extrabold leading-[1.06] tracking-tight text-slate-950 sm:text-6xl">
            Build, analyze, and tailor your resume with CareerLens
          </motion.h1>
          <motion.p variants={fadeUp} className="mx-auto mt-6 max-w-[720px] text-base font-medium leading-7 text-slate-600 sm:text-lg">
            Upload your resume, generate AI feedback, tailor it to a job description, manage LaTeX versions, and create cover letters from the backend features already available.
          </motion.p>
          <motion.div variants={fadeUp} className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link to="/register">
              <button className="inline-flex h-12 items-center justify-center rounded-xl bg-[#6C5CE7] px-6 text-sm font-bold text-white shadow-[0_16px_34px_rgba(108,92,231,0.28)] transition hover:bg-[#584bd4]">
                Get Started
              </button>
            </Link>
            <Link to="/login">
              <button className="inline-flex h-12 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-6 text-sm font-bold text-slate-800 shadow-sm transition hover:border-[#6C5CE7]/30">
                Log in <ArrowRight className="h-4 w-4" />
              </button>
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </section>

    <section className="mx-auto max-w-[1180px] px-4 py-14 sm:px-6">
      <div className="mb-8">
        <h2 className="text-2xl font-extrabold tracking-tight text-slate-950">Implemented Product Surface</h2>
        <p className="mt-2 text-sm font-medium text-slate-500">This UI only advertises flows that exist in the backend.</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {implementedFeatures.map(({ icon: Icon, title, copy }) => (
          <Panel key={title} className="p-5 transition hover:-translate-y-1 hover:shadow-[0_22px_60px_rgba(15,23,42,0.09)]">
            <div className="mb-4 grid h-10 w-10 place-items-center rounded-xl bg-[#6C5CE7]/10 text-[#6C5CE7]">
              <Icon className="h-4 w-4" />
            </div>
            <h3 className="text-sm font-extrabold text-slate-950">{title}</h3>
            <p className="mt-2 text-sm leading-6 text-slate-500">{copy}</p>
          </Panel>
        ))}
      </div>
    </section>
  </main>
);

const ScoreRing = ({ value = 0, label = 'Score' }) => {
  const safeValue = Number.isFinite(Number(value)) ? Math.max(0, Math.min(100, Number(value))) : 0;
  const data = [
    { name: 'Score', value: safeValue, color: '#6C5CE7' },
    { name: 'Remaining', value: 100 - safeValue, color: '#EEF2F7' },
  ];

  return (
    <div className="relative h-36">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie data={data} dataKey="value" innerRadius={46} outerRadius={62} startAngle={90} endAngle={-270} stroke="none">
            {data.map((entry) => <Cell key={entry.name} fill={entry.color} />)}
          </Pie>
          <Tooltip />
        </PieChart>
      </ResponsiveContainer>
      <div className="pointer-events-none absolute inset-0 grid place-items-center text-center">
        <div>
          <p className="text-3xl font-extrabold text-slate-950">{safeValue}</p>
          <p className="text-[11px] font-bold text-slate-500">{label}</p>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ icon: Icon, title, value, copy }) => (
  <Panel className="p-5">
    <div className="mb-4 flex items-center justify-between">
      <span className="grid h-10 w-10 place-items-center rounded-xl bg-[#6C5CE7]/10 text-[#6C5CE7]"><Icon className="h-4 w-4" /></span>
    </div>
    <p className="text-3xl font-extrabold tracking-tight text-slate-950">{value}</p>
    <p className="mt-1 text-xs font-extrabold text-slate-700">{title}</p>
    <p className="mt-2 text-xs leading-5 text-slate-500">{copy}</p>
  </Panel>
);

const WorkflowCard = ({ icon: Icon, title, copy, to, cta }) => (
  <Panel className="flex h-full flex-col p-5 transition hover:-translate-y-0.5 hover:shadow-[0_22px_60px_rgba(15,23,42,0.09)]">
    <div className="mb-4 flex items-start justify-between gap-4">
      <span className="grid h-10 w-10 place-items-center rounded-xl bg-[#6C5CE7]/10 text-[#6C5CE7]"><Icon className="h-4 w-4" /></span>
      <ArrowRight className="h-4 w-4 text-slate-300" />
    </div>
    <h3 className="text-sm font-extrabold text-slate-950">{title}</h3>
    <p className="mt-2 flex-1 text-sm leading-6 text-slate-500">{copy}</p>
    <Link to={to} className="mt-5 inline-flex text-xs font-extrabold text-[#5144d8]">
      {cta}
    </Link>
  </Panel>
);

const RoleAnalysis = ({ user, resume }) => {
  const [roles, setRoles] = useState([]);
  const [selectedRole, setSelectedRole] = useState('');
  const [analysis, setAnalysis] = useState(null);
  const [roadmap, setRoadmap] = useState(null);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const { data } = await axios.get(`${API_URL}/analysis/roles`);
        setRoles(Array.isArray(data) ? data : []);
      } catch (err) {
        setError(err.response?.data?.message || 'Could not load target roles.');
      }
    };
    fetchRoles();
  }, []);

  const seedRoles = async () => {
    setLoading(true);
    setError('');
    try {
      const { data } = await axios.post(`${API_URL}/analysis/seed`);
      setRoles(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.response?.data?.message || 'Could not seed roles.');
    } finally {
      setLoading(false);
    }
  };

  const analyze = async () => {
    if (!selectedRole) return;
    setLoading(true);
    setError('');
    setAnalysis(null);
    setRoadmap(null);
    setProjects([]);

    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const { data } = await axios.post(`${API_URL}/analysis/analyze`, { roleId: selectedRole }, config);
      setAnalysis(data);

      const rawMissing = data.analysis?.missingSkills || [];
      // Extract flat skill names — handles both old string arrays and new object arrays
      const missingSkillNames = rawMissing.map(s => (typeof s === 'string' ? s : s.skill));
      if (missingSkillNames.length > 0) {
        const roadmapRes = await axios.post(`${API_URL}/roadmap/generate`, { roleName: data.role, missingSkills: missingSkillNames }, config);
        setRoadmap(roadmapRes.data);

        const projectRes = await axios.post(`${API_URL}/projects/recommend`, { missingSkills: missingSkillNames }, config);
        setProjects(Array.isArray(projectRes.data) ? projectRes.data : []);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Analysis failed. Check your resume and AI key configuration.');
    } finally {
      setLoading(false);
    }
  };

  const matchData = useMemo(() => {
    const matched = analysis?.analysis?.matchedSkills?.length || 0;
    const missing = analysis?.analysis?.missingSkills?.length || 0;
    return [
      { name: 'Matched', value: matched, color: '#22C55E' },
      { name: 'Missing', value: missing, color: '#EF4444' },
    ];
  }, [analysis]);

  return (
    <Panel className="p-5">
      <div className="mb-5 flex flex-col justify-between gap-4 md:flex-row md:items-start">
        <div>
          <h2 className="text-lg font-extrabold text-slate-950">Role Gap Analysis</h2>
          <p className="mt-1 text-sm text-slate-500">Backend endpoints used: roles, analysis, roadmap, and project recommendations.</p>
        </div>
        {roles.length === 0 && (
          <Button onClick={seedRoles} isLoading={loading} variant="secondary" icon={Plus}>Seed Roles</Button>
        )}
      </div>

      {!resume ? (
        <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 p-5 text-sm font-medium text-slate-500">
          Upload a resume before running role analysis.
        </div>
      ) : (
        <div className="flex flex-col gap-3 md:flex-row">
          <select
            value={selectedRole}
            onChange={(event) => setSelectedRole(event.target.value)}
            className="h-11 flex-1 rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700 outline-none focus:border-[#6C5CE7] focus:ring-4 focus:ring-[#6C5CE7]/10"
          >
            <option value="">Select a target role</option>
            {roles.map((role) => <option key={role._id} value={role._id}>{role.roleName}</option>)}
          </select>
          <Button onClick={analyze} isLoading={loading} disabled={!selectedRole} icon={Target}>Analyze Role Fit</Button>
        </div>
      )}

      {error && (
        <div className="mt-4 flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-600">
          <AlertCircle className="h-4 w-4" />
          {error}
        </div>
      )}

      {analysis && (
        <div className="mt-6 grid gap-5 xl:grid-cols-[260px_1fr]">
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-5">
            <p className="text-xs font-extrabold text-slate-500">Job Readiness</p>
            <ScoreRing value={analysis.scoring?.totalJobReadinessScore || 0} label="readiness" />
            <p className="text-center text-sm font-bold text-slate-800">{analysis.role}</p>
          </div>
          <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4">
                <p className="mb-3 text-xs font-extrabold uppercase text-emerald-700">Matched Skills</p>
                <div className="flex flex-wrap gap-2">
                  {(analysis.analysis?.matchedSkills || []).map((item) => {
                    const name = typeof item === 'string' ? item : item.skill;
                    const prof = typeof item === 'object' ? item.proficiency : null;
                    const profColors = { strong: 'bg-emerald-200', moderate: 'bg-emerald-100', basic: 'bg-emerald-50' };
                    return (
                      <span key={name} className={`rounded-full px-2.5 py-1 text-xs font-bold text-emerald-700 ${profColors[prof] || 'bg-white'}`} title={typeof item === 'object' ? item.evidence : ''}>
                        {name}{prof && <span className="ml-1 text-[10px] font-semibold opacity-60">({prof})</span>}
                      </span>
                    );
                  })}
                  {(analysis.analysis?.matchedSkills || []).length === 0 && <span className="text-sm text-emerald-700">No direct matches found.</span>}
                </div>
              </div>
              <div className="rounded-xl border border-red-200 bg-red-50 p-4">
                <p className="mb-3 text-xs font-extrabold uppercase text-red-700">Missing Skills</p>
                <div className="flex flex-wrap gap-2">
                  {(analysis.analysis?.missingSkills || []).map((item) => {
                    const name = typeof item === 'string' ? item : item.skill;
                    const prio = typeof item === 'object' ? item.priority : null;
                    const prioColors = { critical: 'bg-red-200', important: 'bg-red-100', 'nice-to-have': 'bg-red-50' };
                    return (
                      <span key={name} className={`rounded-full px-2.5 py-1 text-xs font-bold text-red-700 ${prioColors[prio] || 'bg-white'}`} title={typeof item === 'object' ? item.recommendation : ''}>
                        {name}{prio && <span className="ml-1 text-[10px] font-semibold opacity-60">({prio})</span>}
                      </span>
                    );
                  })}
                  {(analysis.analysis?.missingSkills || []).length === 0 && <span className="text-sm text-emerald-700">No missing skills for this role.</span>}
                </div>
              </div>
            </div>
            {analysis.analysis?.overallReadinessVerdict && (
              <div className="mt-3 rounded-xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs font-extrabold uppercase text-slate-500 mb-2">AI Verdict</p>
                <p className="text-sm leading-6 text-slate-700">{analysis.analysis.overallReadinessVerdict}</p>
              </div>
            )}
            <div className="h-48 rounded-xl border border-slate-200 bg-white p-3">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={matchData} dataKey="value" innerRadius={50} outerRadius={70} paddingAngle={4} stroke="none">
                    {matchData.map((entry) => <Cell key={entry.name} fill={entry.color} />)}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {roadmap && (
        <div className="mt-6">
          <h3 className="mb-3 text-sm font-extrabold text-slate-950">Generated Learning Roadmap</h3>
          <div className="grid gap-4 lg:grid-cols-3">
            {['beginner', 'intermediate', 'advanced'].map((level) => (
              <div key={level} className="rounded-xl border border-slate-200 bg-white p-4">
                <p className="mb-3 text-xs font-extrabold uppercase text-[#5144d8]">{level}</p>
                <div className="space-y-3">
                  {(roadmap[level] || []).map((item, index) => (
                    <div key={`${item.skill}-${index}`} className="rounded-lg bg-slate-50 p-3">
                      <p className="text-xs font-extrabold text-slate-800">{item.skill}</p>
                      <p className="mt-1 text-[11px] font-semibold text-slate-500">{item.timeEstimate || 'Self-paced'}</p>
                      {item.resource && <a href={item.resource} target="_blank" rel="noreferrer" className="mt-2 block text-[11px] font-bold text-[#5144d8]">Open resource</a>}
                    </div>
                  ))}
                  {(roadmap[level] || []).length === 0 && <p className="text-xs text-slate-400">No items generated.</p>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {projects.length > 0 && (
        <div className="mt-6">
          <h3 className="mb-3 text-sm font-extrabold text-slate-950">Generated Project Recommendations</h3>
          <div className="grid gap-4 lg:grid-cols-3">
            {projects.map((project) => (
              <div key={project.title} className="rounded-xl border border-slate-200 bg-white p-4">
                <div className="mb-3 flex items-center justify-between">
                  <p className="text-sm font-extrabold text-slate-950">{project.title}</p>
                  <span className="rounded-full bg-[#6C5CE7]/10 px-2 py-1 text-[10px] font-bold text-[#5144d8]">{project.difficulty || 'Project'}</span>
                </div>
                <p className="text-xs leading-5 text-slate-500">{project.description}</p>
                <p className="mt-3 text-[11px] font-bold text-slate-500">Deploy: {project.deployTarget || 'Your choice'}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </Panel>
  );
};

const Workspace = ({ user }) => {
  const [resume, setResume] = useState(null);
  const [resumeLoading, setResumeLoading] = useState(true);
  const [resumeError, setResumeError] = useState('');
  const firstName = user?.name?.split(' ')[0] || 'there';

  useEffect(() => {
    const fetchResume = async () => {
      if (!user?.token) return;
      setResumeLoading(true);
      setResumeError('');
      try {
        const { data } = await axios.get(`${API_URL}/resume`, {
          headers: { Authorization: `Bearer ${user.token}` },
        });
        setResume(data);
      } catch (err) {
        if (err.response?.status !== 404) {
          setResumeError(err.response?.data?.message || 'Could not load resume data.');
        }
        setResume(null);
      } finally {
        setResumeLoading(false);
      }
    };
    fetchResume();
  }, [user]);

  const skills = resume?.extractedSkills || [];
  const hasLatex = Boolean(resume?.rawLatexCode);

  return (
    <main className="min-h-[calc(100vh-64px)] bg-[#FAFBFD]">
      <div className="mx-auto max-w-[1460px] px-4 py-6 sm:px-6">
        <motion.div variants={stagger} initial="hidden" animate="show" className="space-y-5">
          <motion.div variants={fadeUp} className="flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
            <div>
              <p className="text-xs font-extrabold uppercase tracking-wide text-[#6C5CE7]">CareerLens Dashboard</p>
              <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-slate-950">Welcome back, {firstName}</h1>
              <p className="mt-2 text-sm font-medium text-slate-500">Everything shown here is backed by an implemented backend endpoint.</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Link to="/upload"><Button icon={UploadCloud}>Upload Resume</Button></Link>
              <Link to="/settings/keys"><Button variant="secondary" icon={KeyRound}>AI Keys</Button></Link>
            </div>
          </motion.div>

          {resumeError && (
            <motion.div variants={fadeUp} className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-600">
              <AlertCircle className="h-4 w-4" />
              {resumeError}
            </motion.div>
          )}

          {!resumeLoading && !resume && (
            <motion.div variants={fadeUp}>
              <EmptyState
                title="Upload a resume to unlock AI features"
                copy="The backend needs a parsed resume before it can improve your resume, tailor it to jobs, generate LaTeX, create cover letters, or run role gap analysis."
                action={<Link to="/upload" className="mt-6 inline-flex"><Button icon={UploadCloud}>Upload Resume</Button></Link>}
              />
            </motion.div>
          )}

          <motion.div variants={fadeUp} className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <StatCard icon={FileText} title="Resume Status" value={resume ? 'Loaded' : 'Missing'} copy={resume ? 'Parsed resume data is available.' : 'Upload a PDF to begin.'} />
            <StatCard icon={Sparkles} title="Extracted Skills" value={skills.length} copy="Skills extracted from your resume upload." />
            <StatCard icon={Code2} title="LaTeX Resume" value={hasLatex ? 'Ready' : 'Not yet'} copy="Generated when resume upload or builder succeeds." />
            <StatCard icon={Bot} title="AI Provider" value="BYOK" copy="AI endpoints use your saved key or server default." />
          </motion.div>

          {resume && (
            <motion.div variants={fadeUp} className="grid gap-5 xl:grid-cols-[1.15fr_0.85fr]">
              <Panel className="p-5">
                <div className="mb-5 flex items-start justify-between gap-4">
                  <div>
                    <h2 className="text-lg font-extrabold text-slate-950">Parsed Resume Data</h2>
                    <p className="mt-1 text-sm text-slate-500">From GET /api/resume.</p>
                  </div>
                  <Link to="/profile" className="text-xs font-extrabold text-[#5144d8]">Edit Profile</Link>
                </div>
                <div className="mb-5 flex flex-wrap gap-2">
                  {skills.length > 0 ? skills.map((skill) => (
                    <span key={skill} className="rounded-full bg-[#6C5CE7]/10 px-3 py-1 text-xs font-bold text-[#5144d8]">{skill}</span>
                  )) : <span className="text-sm text-slate-500">No skills detected.</span>}
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                    <p className="mb-2 text-xs font-extrabold uppercase text-slate-500">Education</p>
                    <p className="text-sm leading-6 text-slate-700">{resume.education || 'Not detected'}</p>
                  </div>
                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                    <p className="mb-2 text-xs font-extrabold uppercase text-slate-500">Experience</p>
                    <p className="text-sm leading-6 text-slate-700">{resume.experience || 'Not detected'}</p>
                  </div>
                </div>
              </Panel>

              <Panel className="p-5">
                <h2 className="text-lg font-extrabold text-slate-950">Available Resume Actions</h2>
                <div className="mt-4 grid gap-3">
                  <Link to="/resume-ai" className="flex items-center gap-3 rounded-xl border border-slate-200 p-4 transition hover:border-[#6C5CE7]/30 hover:bg-[#6C5CE7]/5">
                    <Gauge className="h-5 w-5 text-[#6C5CE7]" />
                    <span><span className="block text-sm font-extrabold text-slate-950">Improve or optimize resume</span><span className="text-xs text-slate-500">POST /resume/improve and /resume/optimize</span></span>
                  </Link>
                  <Link to="/resume-latex" className="flex items-center gap-3 rounded-xl border border-slate-200 p-4 transition hover:border-[#6C5CE7]/30 hover:bg-[#6C5CE7]/5">
                    <Code2 className="h-5 w-5 text-[#6C5CE7]" />
                    <span><span className="block text-sm font-extrabold text-slate-950">Open LaTeX builder</span><span className="text-xs text-slate-500">Generate, tailor, and version resumes</span></span>
                  </Link>
                  <Link to="/cover-letter" className="flex items-center gap-3 rounded-xl border border-slate-200 p-4 transition hover:border-[#6C5CE7]/30 hover:bg-[#6C5CE7]/5">
                    <PenTool className="h-5 w-5 text-[#6C5CE7]" />
                    <span><span className="block text-sm font-extrabold text-slate-950">Generate cover letter</span><span className="text-xs text-slate-500">POST /resume/cover-letter</span></span>
                  </Link>
                </div>
              </Panel>
            </motion.div>
          )}

          <motion.div variants={fadeUp}>
            <RoleAnalysis user={user} resume={resume} />
          </motion.div>

          <motion.div variants={fadeUp}>
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <WorkflowCard icon={UploadCloud} title="Upload Resume" copy="Parse PDF resume, extract profile data, and create base LaTeX." to="/upload" cta="Open uploader" />
              <WorkflowCard icon={Gauge} title="Resume Analyzer" copy="Get AI improvement feedback and job-description optimization." to="/resume-ai" cta="Open analyzer" />
              <WorkflowCard icon={Code2} title="LaTeX Versions" copy="Generate, save, update, delete, and tailor LaTeX versions." to="/resume-latex" cta="Open builder" />
              <WorkflowCard icon={KeyRound} title="API Keys" copy="Manage supported AI provider keys used by protected AI routes." to="/settings/keys" cta="Manage keys" />
              <WorkflowCard icon={PenTool} title="Cover Letter" copy="Create a tailored cover letter from resume/profile data." to="/cover-letter" cta="Generate letter" />
              <WorkflowCard icon={UserRound} title="Profile" copy="Edit professional profile fields used by generation flows." to="/profile" cta="Edit profile" />
              <WorkflowCard icon={Settings} title="Admin" copy="Admin-only role/project management and stats routes." to="/admin" cta="Open admin" />
              <WorkflowCard icon={Rocket} title="Role Roadmap" copy="Use the analysis card above to generate roadmap and projects." to="/" cta="Use dashboard" />
            </div>
          </motion.div>
        </motion.div>
      </div>
    </main>
  );
};

const Dashboard = () => {
  const { user } = useContext(AuthContext);
  return user ? <Workspace user={user} /> : <Landing />;
};

export default Dashboard;
