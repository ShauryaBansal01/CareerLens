import { useState, useContext, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { FileText, Copy, Check, Sparkles, AlertCircle } from 'lucide-react';
import AuthContext from '../context/AuthContext';
import TaskContext from '../context/TaskContext';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';

const CoverLetter = () => {
  useEffect(() => { document.title = 'Cover Letter | CareerLens'; }, []);
  const { user } = useContext(AuthContext);
  const { startTask, getTask, clearTask, getPageState, setPageState } = useContext(TaskContext);

  // Hydrate from persisted page state
  const persisted = getPageState('cover-letter-page');
  const [jobDescription, setJobDescription] = useState(persisted?.jobDescription || '');
  const [tone, setTone] = useState(persisted?.tone || 'Professional');
  const [editedLetter, setEditedLetter] = useState('');
  const [copied, setCopied] = useState(false);

  // Sync generated result into editable state
  useEffect(() => {
    if (coverLetter) {
      setEditedLetter(coverLetter);
    }
  }, [coverLetter]);

  const handleKeyDown = (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      generateCoverLetter();
    }
  };

  // Persist inputs to context on change
  useEffect(() => {
    setPageState('cover-letter-page', { jobDescription, tone });
  }, [jobDescription, tone, setPageState]);

  // Derive state from TaskContext
  const clTask = getTask('cover-letter');
  const loading = clTask?.status === 'running';
  const coverLetter = clTask?.status === 'completed' ? clTask.result : '';
  const error = clTask?.status === 'failed' ? clTask.error : null;

  const generateCoverLetter = async () => {
    if (!jobDescription || jobDescription.trim().length < 20) {
      return;
    }

    // Clear previous result
    if (clTask && clTask.status !== 'running') {
      clearTask('cover-letter');
    }

    const config = {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${user.token}`,
      },
    };

    startTask(
      'cover-letter',
      'Generating Cover Letter',
      async () => {
        const res = await axios.post(
          `${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/resume/cover-letter`,
          { jobDescription, tone },
          config
        );
        return res.data.coverLetter;
      },
      '/cover-letter',
      [
        'Analyzing job requirements...',
        'Matching your experience to the role...',
        'Drafting cover letter...',
        'Polishing and finalizing...',
      ]
    );
  };

  const copyToClipboard = () => {
    if (!coverLetter) return;
    navigator.clipboard.writeText(editedLetter);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!user) {
    return (
      <div className="min-h-[calc(100vh-64px)] flex items-center justify-center p-6 relative z-10 transition-colors duration-300 bg-bg-main">
        <Card className="text-center max-w-[400px] w-full p-10">
          <AlertCircle className="w-10 h-10 text-red-500 mx-auto mb-5" />
          <h2 className="text-2xl font-bold text-text-main mb-2">Sign in required</h2>
          <p className="text-text-muted">Please log in to generate cover letters.</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-64px)] px-4 py-8 md:py-12 relative z-10">
      <div className="max-w-[1200px] mx-auto w-full">
        {/* Header */}
        <motion.div
           initial={{ opacity: 0, y: 16 }}
           animate={{ opacity: 1, y: 0 }}
           className="mb-8"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-accent-600/10 flex items-center justify-center">
              <FileText className="w-5 h-5 text-accent-600" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-text-main tracking-tight">AI Cover Letter</h1>
          </div>
          <p className="text-[17px] text-text-muted ml-[52px]">Instantly draft ATS-optimized cover letters tailored precisely to the job description.</p>
        </motion.div>

        {error && (
          <div role="alert" className="mb-6 p-4 bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 rounded-xl flex items-center gap-2">
            <AlertCircle size={18} />
            <span className="text-[15px] font-medium">{error}</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Input Panel */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex flex-col gap-6"
          >
            <Card className="flex flex-col h-full p-6">
              <h2 className="text-xl font-bold text-text-main tracking-tight mb-2">
                Target Role
              </h2>
              <p className="text-[14px] text-text-muted mb-4">Paste the Target Job Description below. We'll cross-reference it with your profile data.</p>
              
              <textarea 
                className="block h-64 md:h-80 w-full resize-none rounded-xl border border-border-color bg-bg-card px-4 py-3 text-[14px] leading-6 text-text-main outline-none transition placeholder:text-text-muted/60 focus:border-accent-500 focus:ring-4 focus:ring-accent-500/10"
                placeholder="E.g. We are looking for a Senior Frontend Engineer to join our core product team. You should have 5+ years of experience in React, TypeScript, and Tailwind..."
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                onKeyDown={handleKeyDown}
              />
              <div className="flex items-center justify-between mt-2 mb-6">
                <p className="text-xs text-text-muted">
                  {jobDescription.length < 20 ? (
                    <span className="text-red-500">Minimum 20 characters required</span>
                  ) : (
                    <span className="text-emerald-500">Ready to generate</span>
                  )}
                </p>
                <p className={`text-xs font-medium ${
                  jobDescription.length < 20
                    ? 'text-red-500'
                    : jobDescription.length < 100
                    ? 'text-amber-500'
                    : 'text-emerald-500'
                }`}>
                  {jobDescription.length} characters
                </p>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-4 mt-auto">
                <div className="w-full sm:w-1/3">
                   <label className="block text-xs font-semibold text-text-muted mb-1.5 uppercase tracking-wider">Tone</label>
                   <select 
                     className="block w-full rounded-xl border border-border-color bg-bg-card px-4 py-2.5 text-sm leading-6 text-text-main outline-none transition focus:border-accent-500 focus:ring-4 focus:ring-accent-500/10 appearance-none cursor-pointer"
                     value={tone}
                     onChange={(e) => setTone(e.target.value)}
                   >
                     <option value="Professional">Professional</option>
                     <option value="Enthusiastic">Enthusiastic</option>
                     <option value="Confident">Confident</option>
                     <option value="Creative">Creative</option>
                   </select>
                </div>
                
                <Button 
                  onClick={generateCoverLetter} 
                  disabled={loading || jobDescription.trim().length < 20}
                  className="flex-1 w-full h-[46px] mt-0 sm:mt-5"
                  isLoading={loading}
                  icon={!loading ? Sparkles : undefined}
                >
                  {loading ? 'Drafting...' : 'Generate Letter'}
                </Button>
              </div>
            </Card>
          </motion.div>

          {/* Results Panel */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="h-full"
          >
            <Card className="flex flex-col h-full min-h-[400px] p-6">
               <div className="flex justify-between items-center mb-5">
                 <h2 className="text-[22px] font-bold text-text-main tracking-tight">Generated Output</h2>
                 <Button 
                    onClick={copyToClipboard}
                    disabled={!coverLetter || loading}
                    variant="secondary"
                    size="sm"
                    className="py-1.5 px-4 text-[13px]"
                    icon={copied ? Check : Copy}
                 >
                    {copied ? 'Copied' : 'Copy Text'}
                 </Button>
               </div>

               {loading ? (
                 <div className="flex-1 flex flex-col gap-3 justify-center">
                   <div className="h-4 bg-slate-200 dark:bg-slate-700/50 rounded-full animate-pulse w-3/4 mb-4"></div>
                   <div className="h-4 bg-slate-200 dark:bg-slate-700/50 rounded-full animate-pulse w-full"></div>
                   <div className="h-4 bg-slate-200 dark:bg-slate-700/50 rounded-full animate-pulse w-full"></div>
                   <div className="h-4 bg-slate-200 dark:bg-slate-700/50 rounded-full animate-pulse w-5/6"></div>
                   <div className="h-4 bg-slate-200 dark:bg-slate-700/50 rounded-full animate-pulse w-full mt-4"></div>
                   <div className="h-4 bg-slate-200 dark:bg-slate-700/50 rounded-full animate-pulse w-4/5"></div>
                 </div>
               ) : coverLetter ? (
                 <textarea
                   className="flex-1 h-full min-h-[400px] resize-none text-[15px] leading-relaxed font-sans bg-transparent border-none p-0 focus:ring-0 whitespace-pre-wrap shadow-none text-text-main outline-none"
                   value={editedLetter}
                   onChange={(e) => setEditedLetter(e.target.value)}
                 />
                ) : (
                  <div className="flex-1 flex flex-col items-center justify-center text-text-muted">
                     <FileText size={48} className="mb-4 opacity-50" />
                     <p className="text-[15px] mb-1">Your generated cover letter will appear here.</p>
                     <p className="text-[13px]">Paste a job description on the left and click Generate.</p>
                  </div>
                )}
            </Card>
          </motion.div>

        </div>
      </div>
    </div>
  );
};

export default CoverLetter;
