import { useState, useContext, useRef } from 'react';
import axios from 'axios';
import AuthContext from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { UploadCloud, FileText, CheckCircle2, AlertCircle } from 'lucide-react';

const UploadResume = () => {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [resumeData, setResumeData] = useState(null);
  const [error, setError] = useState(null);
  const { user } = useContext(AuthContext);
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setError(null);
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) {
      setError('Please select a PDF file first!');
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
          'Authorization': `Bearer ${user?.token}`
        }
      });
      setResumeData(res.data);
    } catch (err) {
      console.error(err);
      setError('Error uploading file. Please ensure it is a valid PDF.');
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center p-6 h-[70vh]">
        <div className="text-center glass-card p-10 max-w-md">
          <AlertCircle className="mx-auto h-12 w-12 text-error mb-4" />
          <h2 className="text-2xl font-display font-medium mb-2">Authentication Required</h2>
          <p className="text-on-surface-variant mb-6">You must be logged in to upload your resume securely.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-12 space-y-16 h-full mt-8">
      <div className="text-center mb-16">
        <h1 className="text-4xl md:text-[3.5rem] font-display font-normal text-on-surface tracking-tight leading-tight">Your Digital Career Architect</h1>
        <p className="text-on-surface-variant mt-4 text-lg font-light">Upload your resume to begin your AI-powered career journey.</p>
      </div>

      <motion.div 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="glass-card p-8 sm:p-16 relative overflow-hidden"
      >
        <form onSubmit={handleUpload} className="relative z-10 flex flex-col items-center">
          
          <div 
            onClick={() => fileInputRef.current?.click()}
            className={`w-full max-w-xl p-12 border border-outline-variant/15 ${file ? 'bg-surface-low' : 'bg-surface hover:bg-surface-low'} rounded-xl flex flex-col items-center justify-center cursor-pointer transition-colors duration-300 group`}
          >
            <input 
              type="file" 
              accept="application/pdf"
              onChange={handleFileChange}
              ref={fileInputRef}
              className="hidden"
            />
            
            <AnimatePresence mode="wait">
              {!file ? (
                <motion.div 
                  key="empty"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="flex flex-col items-center text-center"
                >
                  <div className="w-16 h-16 bg-surface-low text-on-surface-variant rounded-full flex items-center justify-center mb-6 group-hover:scale-105 transition-transform duration-300">
                    <UploadCloud className="w-8 h-8 opacity-70" />
                  </div>
                  <p className="text-sm font-medium text-on-surface uppercase tracking-widest">Click to Select a PDF</p>
                  <p className="text-xs text-on-surface-variant mt-2 font-medium">MAX 5MB</p>
                </motion.div>
              ) : (
                <motion.div 
                  key="filled"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex flex-col items-center w-full"
                >
                  <div className="w-16 h-16 bg-surface-lowest rounded-xl flex items-center justify-center mb-6 shadow-ambient">
                    <FileText className="w-8 h-8 text-primary-500" />
                  </div>
                  <p className="text-lg font-medium tracking-tight break-all text-center">{file.name}</p>
                  <p className="text-sm text-on-surface-variant mt-1">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                  <button 
                    type="button" 
                    onClick={(e) => { e.stopPropagation(); setFile(null); }}
                    className="mt-6 text-xs uppercase tracking-wider font-semibold text-error hover:opacity-80 transition-opacity"
                  >
                    Remove File
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {error && (
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-error mt-6 text-sm font-medium flex items-center">
              <AlertCircle className="w-4 h-4 mr-2" /> {error}
            </motion.p>
          )}

          <motion.button 
            whileHover={{ scale: file && !loading ? 1.02 : 1 }}
            whileTap={{ scale: file && !loading ? 0.98 : 1 }}
            type="submit" 
            disabled={!file || loading}
            className={`mt-10 w-full max-w-xs py-4 rounded-xl font-medium tracking-wide transition-all flex justify-center items-center
              ${!file ? 'bg-surface-variant text-on-surface-variant cursor-not-allowed shadow-none' : 
                loading ? 'bg-primary-400 text-white cursor-wait opacity-80' : 
                'bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-ambient'}
            `}
          >
            {loading ? (
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : null}
            {loading ? 'Processing Document...' : 'Analyze My Resume'}
          </motion.button>
        </form>
      </motion.div>

      <AnimatePresence>
        {resumeData && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card mt-16 p-10"
          >
            <div className="flex items-center mb-10">
              <h3 className="text-3xl font-display font-medium">Extraction Successful</h3>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="glass-card-nested p-8">
                <h4 className="text-xs font-bold uppercase tracking-widest text-primary-500 mb-6">
                  Detected Skills
                </h4>
                <div className="flex flex-wrap gap-2">
                  {resumeData.extractedSkills?.length > 0 ? (
                    resumeData.extractedSkills.map((skill, index) => (
                      <span key={index} className="bg-surface-lowest text-on-surface px-4 py-2 rounded-md text-sm font-medium shadow-sm">
                        {skill}
                      </span>
                    ))
                  ) : <span className="text-on-surface-variant text-sm">No specific core skills matched our current database algorithms.</span>}
                </div>
              </div>
              
              <div className="space-y-6">
                <div className="glass-card-nested p-8">
                  <h4 className="text-xs font-bold uppercase tracking-widest text-primary-500 mb-4">
                    Education Context
                  </h4>
                  <p className="text-on-surface-variant text-sm leading-relaxed">{resumeData.education}</p>
                </div>
                <div className="glass-card-nested p-8">
                  <h4 className="text-xs font-bold uppercase tracking-widest text-primary-500 mb-4">
                    Experience Context
                  </h4>
                  <p className="text-on-surface-variant text-sm leading-relaxed">{resumeData.experience}</p>
                </div>
              </div>
            </div>
            
            <div className="mt-12 flex justify-center">
              <Link 
                to="/" 
                className="btn-primary px-8 py-4 rounded-xl flex items-center"
              >
                Go to AI Dashboard for Deep Analysis
                <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6"></path></svg>
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default UploadResume;
