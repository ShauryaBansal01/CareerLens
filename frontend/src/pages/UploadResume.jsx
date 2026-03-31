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
      const res = await axios.post('http://localhost:5000/api/resume/upload', formData, {
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
      <div className="min-h-[calc(100vh-54px)] flex items-center justify-center p-6 bg-surface dark:bg-dark-surface transition-colors duration-200">
        <div className="bg-white dark:bg-dark-card rounded-[20px] p-10 md:p-12 text-center max-w-[400px] w-full shadow-ambient dark:shadow-none">
          <AlertCircle className="w-10 h-10 text-error mx-auto mb-5" />
          <h2 className="text-2xl font-bold text-on-surface dark:text-on-dark tracking-tight mb-2">
            Sign in required
          </h2>
          <p className="text-[15px] text-on-surface-variant dark:text-dark-muted mb-7">
            You need to be signed in to upload your resume.
          </p>
          <Link to="/login" className="btn-apple px-7 py-3">
            Sign In
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-54px)] bg-surface dark:bg-dark-surface px-4 py-12 md:py-16 transition-colors duration-200">
      <div className="max-w-[680px] mx-auto w-full">

        {/* ─── Hero ─── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="mb-10 md:mb-12"
        >
          <h1 className="text-4xl md:text-[40px] font-bold text-on-surface dark:text-on-dark tracking-tighter mb-2.5">
            Upload Your Resume
          </h1>
          <p className="text-[17px] text-on-surface-variant dark:text-dark-muted">
            Our AI analyzes your resume and gives you actionable career insights in seconds.
          </p>
        </motion.div>

        {/* ─── Upload card ─── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.05 }}
          className="apple-card mb-6"
        >
          <form onSubmit={handleUpload}>
            {/* Drop zone */}
            <div
              className={`drop-zone ${dragOver ? 'drag-over' : ''} mb-6`}
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
                    <UploadCloud className="w-10 h-10 text-[#aeaeb2] dark:text-[#636366] mx-auto mb-4 stroke-[1.5]" />
                    <p className="text-[16px] font-semibold text-on-surface dark:text-on-dark tracking-tight mb-1">
                      Drag &amp; drop your resume here
                    </p>
                    <p className="text-[14px] text-on-surface-variant dark:text-dark-muted">or click to browse files</p>
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
                    <p className="text-[13px] text-on-surface-variant dark:text-dark-muted mb-4">
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
                <span key={fmt} className="apple-pill-gray text-[12px]">{fmt}</span>
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
              className="btn-apple-rect"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2.5">
                  <span className="apple-spinner" />
                  Analyzing your resume…
                </span>
              ) : 'Analyze My Resume'}
            </button>
          </form>
        </motion.div>

        {/* ─── Results ─── */}
        <AnimatePresence>
          {resumeData && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35 }}
              className="apple-card"
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
                  <p className="text-[13px] text-on-surface-variant dark:text-dark-muted mt-0.5">
                    Your resume has been successfully processed.
                  </p>
                </div>
              </div>

              <hr className="apple-sep mb-7" />

              {/* Skills */}
              <div className="mb-7">
                <p className="text-[12px] font-semibold text-on-surface-variant dark:text-dark-muted uppercase tracking-[0.06em] mb-3.5">
                  Detected Skills
                </p>
                <div className="flex flex-wrap gap-2">
                  {resumeData.extractedSkills?.length > 0
                    ? resumeData.extractedSkills.map((skill, i) => (
                        <span key={i} className="skill-tag">{skill}</span>
                      ))
                    : <span className="text-[14px] text-[#aeaeb2] dark:text-[#636366]">No specific skills detected.</span>
                  }
                </div>
              </div>

              {/* Education & Experience */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                <div className="bg-[#f5f5f7] dark:bg-[#2c2c2e] rounded-[14px] p-5">
                  <p className="text-[12px] font-semibold text-on-surface-variant dark:text-dark-muted uppercase tracking-[0.06em] mb-2.5">
                    Education
                  </p>
                  <p className="text-[14px] text-on-surface dark:text-on-dark leading-[1.6]">
                    {resumeData.education || 'Not detected'}
                  </p>
                </div>
                <div className="bg-[#f5f5f7] dark:bg-[#2c2c2e] rounded-[14px] p-5">
                  <p className="text-[12px] font-semibold text-on-surface-variant dark:text-dark-muted uppercase tracking-[0.06em] mb-2.5">
                    Experience
                  </p>
                  <p className="text-[14px] text-on-surface dark:text-on-dark leading-[1.6]">
                    {resumeData.experience || 'Not detected'}
                  </p>
                </div>
              </div>

              {/* CTA */}
              <Link to="/" className="btn-apple px-7 py-3 text-[15px]">
                Go to Dashboard →
              </Link>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default UploadResume;
