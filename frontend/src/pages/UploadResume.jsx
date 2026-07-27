import { useState, useContext, useRef, useEffect } from 'react';
import api from '../services/api';
import AuthContext from '../context/AuthContext';
import TaskContext from '../context/TaskContext';
import { Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { UploadCloud, FileText, AlertCircle, CheckCircle } from 'lucide-react';
import { Card, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';


const UPLOAD_STEPS = [
  "Parsing PDF document...",
  "Extracting skills & experience with AI...",
  "Analyzing career trajectory...",
  "Generating ATS-friendly LaTeX code...",
  "Saving profile to database...",
  "Finalizing results..."
];

const UploadResume = () => {
  useEffect(() => { document.title = 'Upload Resume | CareerLens'; }, []);
  const [file, setFile]             = useState(null);
  const [dragOver, setDragOver]     = useState(false);
  const { user } = useContext(AuthContext);
  const { startTask, getTask, clearTask } = useContext(TaskContext);
  const fileInputRef = useRef(null);

  // Derive state from TaskContext
  const uploadTask = getTask('resume-upload');
  const loading = uploadTask?.status === 'running';
  const uploadStep = uploadTask?.currentStep || 0;
  const resumeData = uploadTask?.status === 'completed' ? uploadTask.result : null;
  const error = uploadTask?.status === 'failed' ? uploadTask.error : null;

  const handleKeyDown = (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      handleUpload(e);
    }
  };

  const [fileError, setFileError] = useState('');
  const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

  const validateFile = (f) => {
    if (!f) return false;
    if (f.size > MAX_FILE_SIZE) {
      setFileError(`File too large (${(f.size / 1024 / 1024).toFixed(1)}MB). Maximum is 5MB.`);
      return false;
    }
    setFileError('');
    return true;
  };

  const handleFileChange = (e) => {
    const f = e.target.files?.[0];
    if (f && validateFile(f)) {
      setFile(f);
      if (uploadTask && uploadTask.status !== 'running') {
        clearTask('resume-upload');
      }
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const dropped = e.dataTransfer.files?.[0];
    if (dropped && validateFile(dropped)) {
      setFile(dropped);
      if (uploadTask && uploadTask.status !== 'running') {
        clearTask('resume-upload');
      }
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) return;

    const formData = new FormData();
    formData.append('resume', file);

    startTask(
      'resume-upload',
      'Uploading Resume',
      async () => {
        const res = await api.post(`/resume/upload`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
            Authorization: `Bearer ${user.token}`,
          },
        });
        toast.success('Resume analyzed successfully!');
        return res.data;
      },
      '/upload',
      UPLOAD_STEPS
    );
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-text-main sm:text-3xl">Upload Resume</h1>
        <p className="text-sm text-text-muted mt-1">
          Our AI analyzes your resume and gives you actionable career insights in seconds.
        </p>
      </div>

      <Card className="overflow-hidden">
        <CardContent className="p-0">
          {/* handleKeyDown was defined but never wired up — Ctrl/Cmd+Enter
              now actually submits, matching the hint shown to the user. */}
          <form onSubmit={handleUpload} onKeyDown={handleKeyDown} className="p-6 md:p-8">
            {/* Drop zone */}
            <div
              className={`relative group ${
                dragOver ? 'border-accent-500 bg-accent-50 dark:bg-accent-900/20 scale-[1.01]' : 'border-border-color hover:border-accent-400 bg-bg-card'
              } border-2 border-dashed rounded-xl p-8 cursor-pointer transition-all duration-200 mb-6 flex flex-col items-center justify-center min-h-[260px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500`}
              onClick={() => fileInputRef.current?.click()}
              onDragOver={e => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  fileInputRef.current?.click();
                }
              }}
              role="button"
              aria-label="File upload dropzone"
            >
              <input
                type="file"
                accept="application/pdf,.pdf"
                ref={fileInputRef}
                onChange={handleFileChange}
                className="hidden"
                tabIndex={-1}
              />
              <>
                {loading ? (
                  <div
                    className="text-center py-4"
                  >
                    <div className="relative w-16 h-16 mx-auto mb-4">
                      <div className="absolute inset-0 border-4 border-slate-100 dark:border-slate-800 rounded-full"></div>
                      <div className="absolute inset-0 border-4 border-accent-600 rounded-full border-t-transparent animate-spin"></div>
                      <FileText className="absolute inset-0 m-auto w-6 h-6 text-accent-600" />
                    </div>
                    <p className="text-base font-semibold text-text-main mb-1">
                      {UPLOAD_STEPS[uploadStep]}
                    </p>
                    <p className="text-sm text-text-muted">
                      Please wait, this usually takes 5-15 seconds.
                    </p>
                  </div>
                ) : !file ? (
                  <div
                    className="text-center"
                  >
                    <div className="w-12 h-12 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                      <UploadCloud className="w-6 h-6 text-slate-500" />
                    </div>
                    <p className="text-base font-semibold text-text-main mb-1">
                      Drag &amp; drop your resume here
                    </p>
                    <p className="text-sm text-text-muted mb-4">or click to browse files</p>
                    <div className="flex gap-2 justify-center">
                      <Badge variant="secondary">PDF only</Badge>
                      <Badge variant="secondary">Max 5MB</Badge>
                    </div>
                  </div>
                ) : (
                  <div
                    className="text-center"
                  >
                    <div className="w-12 h-12 bg-accent-50 dark:bg-accent-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                      <FileText className="w-6 h-6 text-accent-600" />
                    </div>
                    <p className="text-base font-semibold text-text-main mb-1">
                      {file.name}
                    </p>
                    <p className="text-sm text-text-muted mb-4">
                      {(file.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      onClick={e => { e.stopPropagation(); setFile(null); }}
                    >
                      Remove file
                    </Button>
                  </div>
                )}
              </>
            </div>

            {/* File Size Error */}
            {fileError && (
              <div
                className="mb-6 flex items-center gap-3 p-4 rounded-lg bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400 text-sm font-medium"
                role="alert"
              >
                <AlertCircle className="w-5 h-5 shrink-0" aria-hidden="true" />
                {fileError}
              </div>
            )}

            {/* Error */}
            {error && (
              <div
                className="mb-6 flex items-center gap-3 p-4 rounded-lg bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400 text-sm font-medium"
                role="alert"
              >
                <AlertCircle className="w-5 h-5 shrink-0" aria-hidden="true" />
                {error}
              </div>
            )}

            {/* Submit */}
            <Button
              onClick={handleUpload}
              disabled={!file || loading}
              className="w-full h-12 text-base"
              isLoading={loading}
            >
              Analyze My Resume
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Results */}
      <>
        {resumeData && (
          <div
            className="space-y-6"
          >
            <Card>
              <CardContent className="p-6 md:p-8">
                <div className="flex items-start gap-4 mb-8">
                  <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0 dark:bg-emerald-900/30 dark:text-emerald-400">
                    <CheckCircle className="w-5 h-5" aria-hidden="true" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-text-main">Analysis complete</h3>
                    <p className="text-sm text-text-muted mt-1">Your resume has been successfully processed.</p>
                  </div>
                </div>

                <div className="space-y-6">
                  <div>
                    <h4 className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-3">Detected Skills</h4>
                    <div className="flex flex-wrap gap-2">
                      {resumeData.extractedSkills?.length > 0
                        ? resumeData.extractedSkills.map((skill, i) => (
                            <Badge key={i} variant="secondary">{skill}</Badge>
                          ))
                        : <span className="text-sm text-text-muted">No specific skills detected.</span>
                      }
                    </div>
                  </div>

                  <div className="grid gap-6 sm:grid-cols-2">
                    <div className="p-4 rounded-lg bg-slate-50 border border-border-color dark:bg-slate-900">
                      <h4 className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-2">Education</h4>
                      <p className="text-sm text-text-main line-clamp-3">
                        {resumeData.education || 'Not detected'}
                      </p>
                    </div>
                    <div className="p-4 rounded-lg bg-slate-50 border border-border-color dark:bg-slate-900">
                      <h4 className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-2">Experience</h4>
                      <p className="text-sm text-text-main line-clamp-3">
                        {resumeData.experience || 'Not detected'}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 mt-8 pt-6 border-t border-border-color">
                  <Link to="/resume-ai" className="flex-1">
                    <Button className="w-full">Go to Resume Analyzer</Button>
                  </Link>
                  <Link to="/resume-latex" className="flex-1">
                    <Button variant="outline" className="w-full">Go to LaTeX Builder</Button>
                  </Link>
                  <Link to="/" className="flex-1">
                    <Button variant="ghost" className="w-full">Go to Dashboard</Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </>
    </div>
  );
};

export default UploadResume;
