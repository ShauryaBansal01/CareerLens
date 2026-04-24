import { useState, useContext, useRef } from 'react';
import axios from 'axios';
import AuthContext from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { UploadCloud, FileText, AlertCircle, CheckCircle } from 'lucide-react';

const UploadResume = () => {
  const [file, setFile]             = useState(null);
  const [loading, setLoading]       = useState(false);
  const [resumeData, setResumeData] = useState(null);
  const [error, setError]           = useState(null);
  const [dragOver, setDragOver]     = useState(false);
  const { user } = useContext(AuthContext);
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    if (e.target.files?.[0]) {
      setFile(e.target.files[0]);
      setError(null);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const dropped = e.dataTransfer.files?.[0];
    if (dropped) { setFile(dropped); setError(null); }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) { setError('Please select a PDF file first.'); return; }

    if (!user?.token) {
      setError('You are not signed in. Please log out and sign back in.');
      return;
    }

    const formData = new FormData();
    formData.append('resume', file);
    try {
      setLoading(true);
      setError(null);
      const res = await axios.post(`${import.meta.env.VITE_API_URL}/resume/upload`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${user.token}`,
        },
      });
      setResumeData(res.data);
    } catch (err) {
      const status = err.response?.status;
      const msg    = err.response?.data?.message;
      if (status === 401) {
        setError('Session expired. Please log out and sign back in.');
      } else if (status === 400) {
        setError(msg || 'Invalid file. Please upload a PDF.');
      } else if (status === 500) {
        setError(msg || 'Server error. Please try again in a moment.');
      } else {
        setError(msg || 'Upload failed. Please ensure the file is a valid PDF under 5MB.');
      }
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-[calc(100vh-64px)] flex items-center justify-center p-6 bg-transparent transition-colors duration-300">
        <div className="glass-card text-center max-w-[400px] w-full">
          <AlertCircle className="w-10 h-10 text-error mx-auto mb-5" />
          <h2 className="text-2xl font-bold text-on-surface dark:text-on-dark tracking-tight mb-2">
            Sign in required
          </h2>
          <p className="text-[15px] text-gray-500 dark:text-on-dark-muted mb-7">
            You need to be signed in to upload your resume.
          </p>
          <Link to="/login" className="btn-premium px-7 py-3">
            Sign In
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-64px)] px-4 py-12 md:py-16 transition-colors duration-300 relative z-10">
      <div className="max-w-[680px] mx-auto w-full">

        {/* ─── Hero ─── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="mb-10 md:mb-12"
        >
          <h1 className="text-4xl md:text-[40px] font-bold tracking-tighter mb-2.5 text-gradient">
            Upload Your Resume
          </h1>
          <p className="text-[17px] text-gray-500 dark:text-dark-muted">
            Our AI analyzes your resume and gives you actionable career insights in seconds.
          </p>
        </motion.div>

        {/* ─── Upload card ─── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.05 }}
          className="glass-card mb-6"
        >
          <form onSubmit={handleUpload}>
            {/* Drop zone */}
            <div
              className={`premium-drop-zone group ${dragOver ? 'drag-over' : ''} mb-6`}
              onClick={() => fileInputRef.current?.click()}
              onDragOver={e => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
            >
              <input
                type="file"
                accept="application/pdf,.docx,.doc"
                ref={fileInputRef}
                onChange={handleFileChange}
                className="hidden"
              />
              <AnimatePresence mode="wait">
                {!file ? (
                  <motion.div
                    key="empty"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="text-center"
                  >
                    <UploadCloud className="w-12 h-12 text-primary-400 dark:text-primary-500 mx-auto mb-4 stroke-1 group-hover:scale-110 transition-transform duration-300 drop-shadow-lg" />
                    <p className="text-[16px] font-semibold text-on-surface dark:text-on-dark tracking-tight mb-1">
                      Drag &amp; drop your resume here
                    </p>
                    <p className="text-[14px] text-gray-500 dark:text-on-dark-muted">or click to browse files</p>
                    <p className="text-[12px] text-[#aeaeb2] dark:text-[#636366] mt-4">Max 5 MB</p>
                  </motion.div>
                ) : (
                  <motion.div
                    key="filled"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    className="text-center"
                  >
                    <FileText className="w-10 h-10 text-primary-500 mx-auto mb-3.5 stroke-[1.5]" />
                    <p className="text-[15px] font-semibold text-on-surface dark:text-on-dark mb-1">
                      {file.name}
                    </p>
                    <p className="text-[13px] text-gray-500 dark:text-on-dark-muted mb-4">
                      {(file.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                    <button
                      type="button"
                      onClick={e => { e.stopPropagation(); setFile(null); }}
                      className="text-[13px] text-error font-medium bg-transparent border-none cursor-pointer hover:underline"
                    >
                      Remove file
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* File format pills */}
            <div className="flex gap-2 flex-wrap mb-8">
              {['PDF', 'DOCX', 'DOC'].map(fmt => (
                <span key={fmt} className="premium-pill-gray">{fmt}</span>
              ))}
            </div>

            {/* Error */}
            {error && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex items-center gap-2 text-[14px] text-error mb-4 bg-error/10 dark:bg-error/20 p-3 rounded-xl"
              >
                <AlertCircle className="w-4 h-4 shrink-0" />
                {error}
              </motion.p>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={!file || loading}
              className="btn-premium w-full py-4 rounded-xl text-[16px]"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2.5 text-white">
                  <span className="premium-spinner border-white/20 border-t-white" />
                  Analyzing & Generating LaTeX...
                </span>
              ) : 'Analyze My Resume'}
            </button>
          </form>
        </motion.div>

        {/* ─── Results ─── */}
        <AnimatePresence>
          {resumeData && (
            <motion.div
              key="upload-results"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35 }}
              className="glass-card shadow-card"
            >
              {/* Success header */}
              <div className="flex items-center gap-3 mb-7">
                <div className="w-9 h-9 rounded-full bg-success/10 dark:bg-success/20 flex items-center justify-center">
                  <CheckCircle className="w-5 h-5 text-success" />
                </div>
                <div>
                  <h3 className="text-[21px] font-semibold text-on-surface dark:text-on-dark tracking-tight">
                    Analysis complete
                  </h3>
                  <p className="text-[13px] text-gray-500 dark:text-on-dark-muted mt-0.5">
                    Your resume has been successfully processed.
                  </p>
                </div>
              </div>

              <hr className="apple-sep mb-7" />

              {/* Skills */}
              <div className="mb-7">
                <p className="text-[12px] font-semibold text-gray-500 dark:text-on-dark-muted uppercase tracking-[0.06em] mb-3.5">
                  Detected Skills
                </p>
                <div className="flex flex-wrap gap-2">
                  {resumeData.extractedSkills?.length > 0
                    ? resumeData.extractedSkills.map((skill, i) => (
                        <span key={i} className="premium-pill-gray">{skill}</span>
                      ))
                    : <span className="text-[14px] text-dark-muted">No specific skills detected.</span>
                  }
                </div>
              </div>

              {/* Education & Experience */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                <div className="bg-[#f5f5f7] dark:bg-[#2c2c2e] rounded-[14px] p-5">
                  <p className="text-[12px] font-semibold text-gray-500 dark:text-on-dark-muted uppercase tracking-[0.06em] mb-2.5">
                    Education
                  </p>
                  <p className="text-[14px] text-on-surface dark:text-on-dark leading-[1.6]">
                    {resumeData.education || 'Not detected'}
                  </p>
                </div>
                <div className="bg-[#f5f5f7] dark:bg-[#2c2c2e] rounded-[14px] p-5">
                  <p className="text-[12px] font-semibold text-gray-500 dark:text-on-dark-muted uppercase tracking-[0.06em] mb-2.5">
                    Experience
                  </p>
                  <p className="text-[14px] text-on-surface dark:text-on-dark leading-[1.6]">
                    {resumeData.experience || 'Not detected'}
                  </p>
                </div>
              </div>

              {/* CTA */}
              <div className="flex flex-col sm:flex-row items-center gap-3 mb-4 mt-6">
                <Link 
                  to="/resume-latex" 
                  className="btn-premium px-7 py-3 text-[15px] flex-1 text-center w-full sm:w-auto"
                >
                  Go to LaTeX Builder →
                </Link>
                <Link 
                  to="/profile" 
                  className="btn-secondary px-7 py-3 text-[15px] flex-1 text-center w-full sm:w-auto"
                >
                  View Profile
                </Link>
              </div>
              <div className="flex flex-col sm:flex-row items-center gap-3">
                <Link 
                  to="/" 
                  className="btn-secondary px-7 py-3 text-[15px] flex-1 text-center w-full sm:w-auto"
                >
                  Go to Dashboard
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default UploadResume;
