import { useState, useContext } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { FileText, Copy, Check, Sparkles, AlertCircle } from 'lucide-react';
import AuthContext from '../context/AuthContext';

const CoverLetter = () => {
  const { user } = useContext(AuthContext);
  const [jobDescription, setJobDescription] = useState('');
  const [tone, setTone] = useState('Professional');
  const [coverLetter, setCoverLetter] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);

  const generateCoverLetter = async () => {
    if (!jobDescription || jobDescription.trim().length < 20) {
      setError('Please provide a valid job description (minimum 20 characters).');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const config = {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user.token}`,
        },
      };

      const res = await axios.post(
        `${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/resume/cover-letter`,
        { jobDescription, tone },
        config
      );

      setCoverLetter(res.data.coverLetter);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to generate cover letter.');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    if (!coverLetter) return;
    navigator.clipboard.writeText(coverLetter);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!user) {
    return (
      <div className="min-h-[calc(100vh-64px)] flex items-center justify-center p-6 relative z-10 transition-colors duration-300">
        <div className="glass-card text-center max-w-[400px] w-full">
          <AlertCircle className="w-10 h-10 text-error mx-auto mb-5" />
          <h2 className="text-2xl font-bold text-on-surface dark:text-on-dark mb-2">Sign in required</h2>
          <p className="text-on-surface-variant dark:text-dark-muted">Please log in to generate cover letters.</p>
        </div>
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
            <div className="w-10 h-10 rounded-xl bg-violet-500/10 dark:bg-violet-500/20 flex items-center justify-center">
              <FileText className="w-5 h-5 text-violet-600 dark:text-violet-400" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-on-surface dark:text-on-dark tracking-tight">AI Cover Letter</h1>
          </div>
          <p className="text-[17px] text-gray-500 dark:text-dark-muted ml-[52px]">Instantly draft ATS-optimized cover letters tailored precisely to the job description.</p>
        </motion.div>

        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 rounded-xl flex items-center gap-2">
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
            <div className="glass-card flex flex-col h-full">
              <h2 className="section-title">
                Target Role
              </h2>
              <p className="text-[14px] text-gray-500 dark:text-dark-muted mb-4">Paste the Target Job Description below. We'll cross-reference it with your profile data.</p>
              
              <textarea 
                className="premium-input h-64 md:h-80 resize-none mb-6 text-[14px]"
                placeholder="E.g. We are looking for a Senior Frontend Engineer to join our core product team. You should have 5+ years of experience in React, TypeScript, and Tailwind..."
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
              />

              <div className="flex flex-col sm:flex-row items-center gap-4 mt-auto">
                <div className="w-full sm:w-1/3">
                   <label className="block text-xs font-semibold text-gray-500 dark:text-dark-muted mb-1.5 uppercase tracking-wider">Tone</label>
                   <select 
                     className="premium-input py-2.5 px-3 appearance-none cursor-pointer"
                     value={tone}
                     onChange={(e) => setTone(e.target.value)}
                   >
                     <option value="Professional">Professional</option>
                     <option value="Enthusiastic">Enthusiastic</option>
                     <option value="Confident">Confident</option>
                     <option value="Creative">Creative</option>
                   </select>
                </div>
                
                <button 
                  onClick={generateCoverLetter} 
                  disabled={loading}
                  className="btn-premium flex-1 w-full flex items-center gap-2 h-[46px] mt-0 sm:mt-5"
                >
                  {loading ? <span className="premium-spinner border-white/20 border-t-white" /> : <Sparkles size={18} />}
                  {loading ? 'Drafting...' : 'Generate Letter'}
                </button>
              </div>
            </div>
          </motion.div>

          {/* Results Panel */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="h-full"
          >
            <div className="glass-card flex flex-col h-full min-h-[400px]">
               <div className="flex justify-between items-center mb-5">
                 <h2 className="text-[22px] font-bold text-on-surface dark:text-on-dark tracking-tight">Generated Output</h2>
                 <button 
                    onClick={copyToClipboard}
                    disabled={!coverLetter || loading}
                    className="btn-secondary py-1.5 px-4 text-[13px] gap-1.5"
                 >
                    {copied ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
                    {copied ? 'Copied' : 'Copy Text'}
                 </button>
               </div>

               {loading ? (
                 <div className="flex-1 flex flex-col gap-3 justify-center">
                   <div className="h-4 bg-gray-200 dark:bg-white/5 rounded-full animate-pulse w-3/4 mb-4"></div>
                   <div className="h-4 bg-gray-200 dark:bg-white/5 rounded-full animate-pulse w-full"></div>
                   <div className="h-4 bg-gray-200 dark:bg-white/5 rounded-full animate-pulse w-full"></div>
                   <div className="h-4 bg-gray-200 dark:bg-white/5 rounded-full animate-pulse w-5/6"></div>
                   <div className="h-4 bg-gray-200 dark:bg-white/5 rounded-full animate-pulse w-full mt-4"></div>
                   <div className="h-4 bg-gray-200 dark:bg-white/5 rounded-full animate-pulse w-4/5"></div>
                 </div>
               ) : coverLetter ? (
                 <textarea
                   className="premium-input flex-1 h-full min-h-[400px] resize-none text-[15px] leading-relaxed font-sans bg-transparent dark:bg-transparent border-none p-0 focus:ring-0 whitespace-pre-wrap shadow-none"
                   value={coverLetter}
                   onChange={(e) => setCoverLetter(e.target.value)}
                 />
               ) : (
                 <div className="flex-1 flex flex-col items-center justify-center text-gray-400 dark:text-dark-muted">
                    <FileText size={48} className="mb-4 opacity-50" />
                    <p className="text-[15px]">Your generated cover letter will appear here.</p>
                 </div>
               )}
            </div>
          </motion.div>

        </div>
      </div>
    </div>
  );
};

export default CoverLetter;
