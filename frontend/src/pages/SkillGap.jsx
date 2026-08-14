import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import {
  Target,
  Sparkles,
  AlertCircle,
  CheckCircle2,
  CircleDashed,
  UploadCloud,
  KeyRound,
  History,
  Route,
  Rocket,
  ExternalLink,
} from 'lucide-react';
import api from '../services/api';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';

const PROFICIENCY_VARIANT = { strong: 'success', moderate: 'primary', basic: 'secondary' };
const PRIORITY_VARIANT = { critical: 'destructive', important: 'primary', 'nice-to-have': 'secondary' };
const PRIORITY_ORDER = { critical: 0, important: 1, 'nice-to-have': 2 };

const DIFFICULTY_VARIANT = { Beginner: 'success', Intermediate: 'primary', Advanced: 'destructive' };

const ROADMAP_PHASES = [
  { key: 'beginner', label: 'Foundations', weeks: 'Weeks 1–4' },
  { key: 'intermediate', label: 'Applied', weeks: 'Weeks 5–10' },
  { key: 'advanced', label: 'Production', weeks: 'Weeks 11–16' },
];

const hasRoadmapContent = (roadmap) =>
  ROADMAP_PHASES.some(({ key }) => (roadmap?.[key]?.length ?? 0) > 0);

const formatDate = (value) =>
  value ? new Date(value).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : '';

/** Turn an axios failure into something a user can act on. */
function describeError(err) {
  const status = err.response?.status;
  const message = err.response?.data?.message;

  if (status === 404 && /resume/i.test(message || '')) {
    return { text: 'Upload a resume before running an analysis.', action: { to: '/upload', label: 'Upload resume', icon: UploadCloud } };
  }
  if (status === 503) {
    return { text: message || 'No active AI API key found.', action: { to: '/settings/keys', label: 'Add an API key', icon: KeyRound } };
  }
  if (status === 429) {
    return { text: 'You have hit the analysis rate limit. Try again in a few minutes.' };
  }
  return { text: message || 'Something went wrong running the analysis.' };
}

const SkillGap = () => {
  useEffect(() => { document.title = 'Skill Gap | CareerLens'; }, []);

  const [roles, setRoles] = useState([]);
  const [selectedRoleId, setSelectedRoleId] = useState('');
  const [record, setRecord] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState(null);

  // The learning plan is a second, separate AI step. It is not folded into
  // `runAnalysis` because it costs two more calls and is only useful once the
  // user has actually looked at their gaps and decided to act on them.
  //
  // The roadmap is persisted server-side onto the UserAnalysis record, so it
  // comes back for free with /analysis/latest. The project list is not — the
  // endpoint returns it without saving — so it lives in component state and is
  // regenerated on demand.
  const [projects, setProjects] = useState([]);
  const [buildingPlan, setBuildingPlan] = useState(false);

  // Load a stored result. This is a plain Mongo read — no AI call, no cost —
  // which is what lets the page restore itself on every visit.
  const loadStored = useCallback(async (roleId) => {
    try {
      const { data } = await api.get('/analysis/latest', { params: roleId ? { roleId } : {} });
      setRecord(data);
      return data;
    } catch (err) {
      if (err.response?.status !== 404) setError(describeError(err));
      setRecord(null);
      return null;
    }
  }, []);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const [rolesRes, historyRes] = await Promise.all([
          api.get('/analysis/roles'),
          api.get('/analysis/history').catch(() => ({ data: [] })),
        ]);
        if (cancelled) return;

        setRoles(rolesRes.data || []);
        setHistory(historyRes.data || []);

        const stored = await loadStored();
        if (cancelled) return;
        if (stored?.roleId) setSelectedRoleId(stored.roleId);
      } catch (err) {
        if (!cancelled) setError(describeError(err));
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => { cancelled = true; };
  }, [loadStored]);

  const analyzedAt = (roleId) => history.find((h) => h.roleId === roleId)?.updatedAt;
  const isCached = Boolean(analyzedAt(selectedRoleId));
  const showingSelectedRole = record?.roleId === selectedRoleId;

  const handleRoleChange = async (roleId) => {
    setSelectedRoleId(roleId);
    setError(null);
    setRecord(null);
    // Projects belong to the previous role's gaps — showing them against a new
    // role would be actively misleading.
    setProjects([]);
    // Only reach for a stored result — never analyse on selection, or simply
    // browsing the dropdown would bill an AI call per role.
    if (roleId && analyzedAt(roleId)) await loadStored(roleId);
  };

  const runAnalysis = async () => {
    if (!selectedRoleId) return;
    setAnalyzing(true);
    setError(null);

    try {
      const { data } = await api.post('/analysis/analyze', { roleId: selectedRoleId });
      setRecord({ ...data, updatedAt: new Date().toISOString() });
      setHistory((prev) => [
        { roleId: selectedRoleId, roleName: data.role, updatedAt: new Date().toISOString() },
        ...prev.filter((h) => h.roleId !== selectedRoleId),
      ]);
      // A re-run produces a new gap set, so any plan built from the old one is
      // stale. The server clears the stored roadmap for the same reason.
      setProjects([]);
      toast.success(`Analysis complete for ${data.role}`);
    } catch (err) {
      const described = describeError(err);
      setError(described);
      toast.error(described.text);
    } finally {
      setAnalyzing(false);
    }
  };

  const analysis = showingSelectedRole ? record?.analysis : null;
  const scoring = showingSelectedRole ? record?.scoring : null;
  const roadmap = showingSelectedRole ? record?.roadmap : null;

  const missingSorted = [...(analysis?.missingSkills || [])].sort(
    (a, b) => (PRIORITY_ORDER[a.priority] ?? 9) - (PRIORITY_ORDER[b.priority] ?? 9)
  );

  /**
   * Builds the learning plan: a phased roadmap plus concrete portfolio projects,
   * both derived from the gaps this analysis found.
   *
   * The two calls run concurrently because neither depends on the other, and
   * they are settled rather than raced so one failing still shows the other —
   * a roadmap with no project ideas is far better than an error page.
   */
  const buildPlan = async () => {
    const missingSkills = missingSorted.map((item) => item.skill);
    if (!missingSkills.length) return;

    setBuildingPlan(true);
    setError(null);

    const [roadmapResult, projectsResult] = await Promise.allSettled([
      // `roleName` from a stored record, `role` from a fresh analyze response.
      api.post('/roadmap/generate', { roleName: record.roleName ?? record.role, missingSkills }),
      api.post('/projects/recommend', { missingSkills }),
    ]);

    if (roadmapResult.status === 'fulfilled') {
      const { role: _role, ...phases } = roadmapResult.value.data;
      setRecord((prev) => (prev ? { ...prev, roadmap: phases } : prev));
    }

    if (projectsResult.status === 'fulfilled') {
      setProjects(Array.isArray(projectsResult.value.data) ? projectsResult.value.data : []);
    }

    if (roadmapResult.status === 'rejected' && projectsResult.status === 'rejected') {
      const described = describeError(roadmapResult.reason);
      setError(described);
      toast.error(described.text);
    } else if (roadmapResult.status === 'rejected' || projectsResult.status === 'rejected') {
      toast.error('Part of the plan could not be generated. Showing what came back.');
    } else {
      toast.success('Learning plan ready');
    }

    setBuildingPlan(false);
  };

  return (
    <div className="min-h-[calc(100vh-64px)] px-4 py-8 md:py-12 relative z-10">
      <div className="max-w-[1200px] mx-auto w-full">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-accent-600/10 flex items-center justify-center">
              <Target className="w-5 h-5 text-accent-600" aria-hidden="true" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-text-main tracking-tight">Skill Gap Analysis</h1>
          </div>
          <p className="text-[17px] text-text-muted sm:ml-[52px]">
            Measure your resume against a target role to see what you already have and what to learn next.
          </p>
        </div>

        {error && (
          <div role="alert" className="mb-6 p-4 bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 rounded-xl flex flex-wrap items-center gap-3">
            <AlertCircle size={18} aria-hidden="true" />
            <span className="text-[15px] font-medium flex-1 min-w-[12rem]">{error.text}</span>
            {error.action && (
              <Link to={error.action.to}>
                <Button size="sm" variant="outline" icon={error.action.icon}>{error.action.label}</Button>
              </Link>
            )}
          </div>
        )}

        {/* ── Role picker ─────────────────────────────────────────────── */}
        <Card className="p-6 mb-8">
          <h2 className="text-xl font-bold text-text-main tracking-tight mb-1">Target role</h2>
          <p className="text-[14px] text-text-muted mb-5">
            Pick the role you are aiming for. Results are saved per role, so returning to one you have already run costs nothing.
          </p>

          {loading ? (
            <div role="status" aria-live="polite" className="flex items-center gap-3 text-text-muted">
              <span className="h-4 w-4 motion-safe:animate-spin rounded-full border-2 border-accent-500 border-t-transparent" aria-hidden="true" />
              <span className="text-sm">Loading roles…</span>
            </div>
          ) : roles.length === 0 ? (
            <div className="rounded-xl border border-border-color bg-slate-50 dark:bg-slate-900 p-4">
              <p className="text-sm text-text-main font-medium mb-1">No target roles are configured yet.</p>
              <p className="text-sm text-text-muted">
                An administrator needs to seed the role catalogue (<code className="text-xs">npm run seed:roles</code>) before this page can be used.
              </p>
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row sm:items-end gap-4">
              <div className="flex-1">
                <label htmlFor="target-role" className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                  Role
                </label>
                <select
                  id="target-role"
                  value={selectedRoleId}
                  onChange={(e) => handleRoleChange(e.target.value)}
                  className="block w-full min-h-[44px] rounded-xl border border-border-color bg-bg-card px-4 py-2.5 text-[14px] text-text-main outline-none transition focus:border-accent-500 focus:ring-4 focus:ring-accent-500/10"
                >
                  <option value="">Select a role…</option>
                  {roles.map((role) => (
                    <option key={role._id} value={role._id}>
                      {role.roleName}{analyzedAt(role._id) ? ' — analysed' : ''}
                    </option>
                  ))}
                </select>
              </div>

              <Button
                onClick={runAnalysis}
                disabled={!selectedRoleId || analyzing}
                isLoading={analyzing}
                icon={Sparkles}
                className="min-h-[44px] sm:w-auto"
              >
                {analyzing ? 'Analysing…' : isCached ? 'Re-run analysis' : 'Analyse'}
              </Button>
            </div>
          )}

          {selectedRoleId && !loading && (
            <p className="text-xs text-text-muted mt-3 flex items-center gap-1.5">
              <History className="h-3.5 w-3.5" aria-hidden="true" />
              {isCached
                ? `Last analysed ${formatDate(analyzedAt(selectedRoleId))}. Re-running uses one AI call.`
                : 'Not analysed yet. Running this uses one AI call.'}
            </p>
          )}
        </Card>

        {analyzing && (
          <div role="status" aria-live="polite" className="mb-8 flex items-center gap-3 text-text-muted">
            <span className="h-4 w-4 motion-safe:animate-spin rounded-full border-2 border-accent-500 border-t-transparent" aria-hidden="true" />
            <span className="text-sm">Comparing your resume against the role. This usually takes a few seconds.</span>
          </div>
        )}

        {/* ── Results ─────────────────────────────────────────────────── */}
        {analysis && !analyzing && (
          <div className="motion-safe:animate-fade-in space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="p-6">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">Skills matched</p>
                <p className="text-4xl font-bold text-text-main tracking-tight">{analysis.matchPercentage ?? 0}%</p>
                <p className="text-sm text-text-muted mt-1">
                  {analysis.matchedSkills?.length ?? 0} of {analysis.totalRequired ?? 0} required skills
                </p>
              </Card>

              <Card className="p-6 md:col-span-2">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">Readiness verdict</p>
                <p className="text-[15px] leading-relaxed text-text-main">
                  {analysis.overallReadinessVerdict || 'No verdict returned for this run.'}
                </p>
                {scoring && (
                  <p className="text-xs text-text-muted mt-4">
                    Job readiness score {Math.round(scoring.totalJobReadinessScore ?? 0)} — skills{' '}
                    {Math.round(scoring.skillsScore ?? 0)}, experience {scoring.experienceScore ?? 0}, consistency{' '}
                    {scoring.consistencyScore ?? 0}
                  </p>
                )}
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Matched */}
              <Card className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <CheckCircle2 className="h-5 w-5 text-emerald-500" aria-hidden="true" />
                  <h2 className="text-xl font-bold text-text-main tracking-tight">
                    Skills you have ({analysis.matchedSkills?.length ?? 0})
                  </h2>
                </div>
                {analysis.matchedSkills?.length ? (
                  <ul className="space-y-3">
                    {analysis.matchedSkills.map((item) => (
                      <li key={item.skill} className="rounded-lg border border-border-color p-3">
                        <div className="flex items-center justify-between gap-3 mb-1">
                          {/* `capitalize` would word-capitalize on the dot and
                              render "node.js" as "Node.Js"; only the first
                              letter should change. */}
                          <span className="text-sm font-semibold text-text-main first-letter:uppercase">{item.skill}</span>
                          <Badge variant={PROFICIENCY_VARIANT[item.proficiency] || 'secondary'}>{item.proficiency}</Badge>
                        </div>
                        {item.evidence && <p className="text-xs text-text-muted leading-relaxed">{item.evidence}</p>}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-text-muted">None of the required skills matched your resume.</p>
                )}
              </Card>

              {/* Missing */}
              <Card className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <CircleDashed className="h-5 w-5 text-amber-500" aria-hidden="true" />
                  <h2 className="text-xl font-bold text-text-main tracking-tight">
                    Skills to learn ({missingSorted.length})
                  </h2>
                </div>
                {missingSorted.length ? (
                  <ul className="space-y-3">
                    {missingSorted.map((item) => (
                      <li key={item.skill} className="rounded-lg border border-border-color p-3">
                        <div className="flex items-center justify-between gap-3 mb-1">
                          {/* `capitalize` would word-capitalize on the dot and
                              render "node.js" as "Node.Js"; only the first
                              letter should change. */}
                          <span className="text-sm font-semibold text-text-main first-letter:uppercase">{item.skill}</span>
                          <Badge variant={PRIORITY_VARIANT[item.priority] || 'secondary'}>{item.priority}</Badge>
                        </div>
                        {item.recommendation && (
                          <p className="text-xs text-text-muted leading-relaxed">{item.recommendation}</p>
                        )}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-text-muted">You cover every required skill for this role.</p>
                )}
              </Card>
            </div>

            {/* ── Learning plan ────────────────────────────────────────── */}
            {missingSorted.length > 0 && (
              <Card className="p-6">
                <div className="flex flex-wrap items-start justify-between gap-4 mb-5">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <Route className="h-5 w-5 text-accent-600" aria-hidden="true" />
                      <h2 className="text-xl font-bold text-text-main tracking-tight">Learning plan</h2>
                    </div>
                    <p className="text-[14px] text-text-muted">
                      A phased roadmap and portfolio projects built from the {missingSorted.length} skill
                      {missingSorted.length === 1 ? '' : 's'} above.
                    </p>
                  </div>

                  <Button
                    onClick={buildPlan}
                    disabled={buildingPlan}
                    isLoading={buildingPlan}
                    variant={hasRoadmapContent(roadmap) ? 'outline' : 'default'}
                    icon={Sparkles}
                    className="min-h-[44px]"
                  >
                    {buildingPlan
                      ? 'Building…'
                      : hasRoadmapContent(roadmap)
                        ? 'Rebuild plan'
                        : 'Build learning plan'}
                  </Button>
                </div>

                {!hasRoadmapContent(roadmap) && !projects.length && !buildingPlan && (
                  <p className="text-sm text-text-muted">
                    Not generated yet. Building this uses two AI calls.
                  </p>
                )}

                {hasRoadmapContent(roadmap) && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {ROADMAP_PHASES.map(({ key, label, weeks }) => (
                      <div key={key} className="rounded-xl border border-border-color p-4">
                        <div className="mb-3">
                          <p className="text-sm font-bold text-text-main">{label}</p>
                          <p className="text-xs text-text-muted">{weeks}</p>
                        </div>
                        {roadmap[key]?.length ? (
                          <ul className="space-y-2.5">
                            {roadmap[key].map((step, i) => (
                              <li key={`${key}-${step.skill || i}`} className="text-sm">
                                <div className="flex items-start justify-between gap-2">
                                  <span className="font-medium text-text-main first-letter:uppercase">
                                    {step.skill}
                                  </span>
                                  {step.timeEstimate && (
                                    <span className="text-[11px] text-text-muted shrink-0 mt-0.5">
                                      {step.timeEstimate}
                                    </span>
                                  )}
                                </div>
                                {step.resource && (
                                  <a
                                    href={step.resource}
                                    target="_blank"
                                    /* noreferrer as well as noopener: without it the
                                       destination receives this app's URL as referrer. */
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-1 text-[11px] text-accent-600 hover:underline mt-0.5"
                                  >
                                    Resource <ExternalLink className="h-3 w-3" aria-hidden="true" />
                                  </a>
                                )}
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <p className="text-xs text-text-muted">Nothing scheduled for this phase.</p>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {projects.length > 0 && (
                  <div className="mt-6 pt-6 border-t border-border-color">
                    <div className="flex items-center gap-2 mb-4">
                      <Rocket className="h-5 w-5 text-accent-600" aria-hidden="true" />
                      <h3 className="text-lg font-bold text-text-main tracking-tight">
                        Portfolio projects ({projects.length})
                      </h3>
                    </div>
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                      {projects.map((project, i) => (
                        <div key={project.title || i} className="rounded-xl border border-border-color p-4">
                          <div className="flex items-start justify-between gap-2 mb-2">
                            <p className="text-sm font-bold text-text-main">{project.title}</p>
                            {project.difficulty && (
                              <Badge variant={DIFFICULTY_VARIANT[project.difficulty] || 'secondary'}>
                                {project.difficulty}
                              </Badge>
                            )}
                          </div>
                          {project.description && (
                            <p className="text-xs text-text-muted leading-relaxed mb-3">{project.description}</p>
                          )}
                          {project.requiredSkills?.length > 0 && (
                            <div className="flex flex-wrap gap-1.5 mb-2">
                              {project.requiredSkills.map((skill) => (
                                <span
                                  key={skill}
                                  className="text-[11px] px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-text-muted"
                                >
                                  {skill}
                                </span>
                              ))}
                            </div>
                          )}
                          {project.deployTarget && (
                            <p className="text-[11px] text-text-muted">Deploy to {project.deployTarget}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </Card>
            )}
          </div>
        )}

        {/* Selected a role that has no stored analysis yet */}
        {!analysis && !analyzing && !loading && selectedRoleId && (
          <Card className="p-10 text-center">
            <Target className="h-8 w-8 text-slate-300 dark:text-slate-600 mx-auto mb-3" aria-hidden="true" />
            <p className="text-text-main font-semibold mb-1">No analysis for this role yet</p>
            <p className="text-sm text-text-muted">Choose “Analyse” above to compare your resume against it.</p>
          </Card>
        )}
      </div>
    </div>
  );
};

export default SkillGap;
