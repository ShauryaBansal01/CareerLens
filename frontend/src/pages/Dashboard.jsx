import React, { useContext, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import api from '../services/api';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { 
  FileText, 
  UploadCloud, 
  TrendingUp, 
  Code2, 
  PenTool, 
  Activity,
  Calendar,
  AlertCircle
} from 'lucide-react';
import { motion } from 'framer-motion';

export default function Dashboard() {
  useEffect(() => { document.title = 'Dashboard | CareerLens'; }, []);
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get('/resume');
        const resume = res.data;
        setStats({
          totalResumes: resume ? 1 : 0,
          lastUpdated: resume ? new Date(resume.updatedAt).toLocaleDateString() : 'Never',
          activeResume: resume || null
        });
      } catch (err) {
        if (err.response?.status === 404) {
          setStats({ totalResumes: 0, lastUpdated: 'Never', activeResume: null });
        } else {
          console.error('Failed to fetch stats:', err);
        }
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const actions = [
    { title: 'Upload Resume', desc: 'Upload a new PDF to analyze.', icon: UploadCloud, path: '/upload', color: 'text-blue-500' },
    { title: 'AI Analysis', desc: 'Get AI feedback on your resume.', icon: TrendingUp, path: '/resume-ai', color: 'text-emerald-500' },
    { title: 'LaTeX Builder', desc: 'Generate a LaTeX formatted PDF.', icon: Code2, path: '/resume-latex', color: 'text-purple-500' },
    { title: 'Cover Letter', desc: 'Generate a matching cover letter.', icon: PenTool, path: '/cover-letter', color: 'text-orange-500' },
  ];

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-text-main sm:text-3xl">Dashboard</h1>
          <p className="text-sm text-text-muted mt-1">
            Welcome back, {user?.name}. Here's an overview of your career tools.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button onClick={() => navigate('/upload')} className="gap-2">
            <UploadCloud className="h-4 w-4" aria-hidden="true" />
            Upload New
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-text-muted">Total Resumes</CardTitle>
            <FileText className="h-4 w-4 text-slate-400" aria-hidden="true" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-text-main">
              {loading ? <div className="h-8 w-16 animate-pulse bg-slate-200 dark:bg-slate-800 rounded" /> : stats?.totalResumes || 0}
            </div>
            <p className="text-xs text-text-muted mt-1">Uploaded to CareerLens</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-text-muted">Last Updated</CardTitle>
            <Calendar className="h-4 w-4 text-slate-400" aria-hidden="true" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-text-main">
              {loading ? <div className="h-8 w-24 animate-pulse bg-slate-200 dark:bg-slate-800 rounded" /> : stats?.lastUpdated}
            </div>
            <p className="text-xs text-text-muted mt-1">Most recent activity</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-text-muted">System Status</CardTitle>
            <Activity className="h-4 w-4 text-slate-400" aria-hidden="true" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-text-main flex items-center gap-2">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
              </span>
              Operational
            </div>
            <p className="text-xs text-text-muted mt-1">All systems normal</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-text-muted">API Connection</CardTitle>
            <AlertCircle className="h-4 w-4 text-slate-400" aria-hidden="true" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-text-main">Configured</div>
            <p className="text-xs text-text-muted mt-1">Gemini AI ready</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
        {/* Active Resume / Main Activity area */}
        <Card className="lg:col-span-4">
          <CardHeader>
            <CardTitle>Active Resume</CardTitle>
            <CardDescription>
              Your primary resume used for AI analysis and tailored cover letters.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-4">
                <div className="h-16 animate-pulse bg-slate-100 dark:bg-slate-800 rounded-lg" />
              </div>
            ) : stats?.activeResume ? (
              <div className="rounded-lg border border-border-color p-4 bg-slate-50 dark:bg-slate-900 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-white dark:bg-slate-800 rounded-md shadow-sm border border-border-color">
                    <FileText className="h-6 w-6 text-accent-600 dark:text-accent-400" aria-hidden="true" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-text-main">
                      {stats.activeResume.fileName || 'Master Resume'}
                    </h3>
                    <p className="text-sm text-text-muted">
                      Uploaded on {new Date(stats.activeResume.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <Badge variant="default">Master</Badge>
              </div>
            ) : (
              <div className="text-center py-8 px-4 border-2 border-dashed border-border-color rounded-xl">
                <UploadCloud className="mx-auto h-8 w-8 text-slate-400 mb-3" aria-hidden="true" />
                <h3 className="text-sm font-semibold text-text-main">No resume uploaded</h3>
                <p className="text-sm text-text-muted mt-1 mb-4">Upload a resume to get started with analysis.</p>
                <Button onClick={() => navigate('/upload')} size="sm">Upload Resume</Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>
              Access your career tools and generators.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {actions.map((action, i) => (
              <Link
                key={i}
                to={action.path}
                className="group flex flex-col items-start gap-2 rounded-lg border border-border-color p-4 hover:border-accent-500 hover:bg-slate-50 dark:hover:bg-slate-900 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500"
              >
                <div className={`rounded-md p-2 bg-slate-100 dark:bg-slate-800 ${action.color} group-hover:scale-110 transition-transform`}>
                  <action.icon className="h-5 w-5" aria-hidden="true" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-text-main">{action.title}</h4>
                  <p className="text-xs text-text-muted mt-0.5 line-clamp-2">{action.desc}</p>
                </div>
              </Link>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
