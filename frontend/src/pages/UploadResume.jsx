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
        <div className="text-center glass-card p-10 rounded-2xl max-w-md">
          <AlertCircle className="mx-auto h-12 w-12 text-rose-500 mb-4" />
          <h2 className="text-2xl font-bold text-slate-800 mb-2">Authentication Required</h2>
          <p className="text-slate-600 mb-6">You must be logged in to upload your resume securely.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8 space-y-8 h-full">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 tracking-tight">Upload Your Resume</h1>
        <p className="text-slate-500 mt-2 text-lg">Let our AI extract your skills and experience to build a personalized roadmap.</p>
      </div>

      <motion.div 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="glass-card rounded-3xl p-8 sm:p-12 border border-white/60 relative overflow-hidden shadow-2xl shadow-indigo-100"
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-indigo-100 to-purple-50 rounded-full blur-3xl opacity-50 -mr-20 -mt-20"></div>

        <form onSubmit={handleUpload} className="relative z-10 flex flex-col items-center">
          
          <div 
            onClick={() => fileInputRef.current?.click()}
            className={`w-full max-w-xl p-8 sm:p-12 border-2 ${file ? 'border-indigo-400 bg-indigo-50/50' : 'border-dashed border-indigo-200 hover:border-indigo-400 hover:bg-slate-50/50'} rounded-2xl flex flex-col items-center justify-center cursor-pointer transition-all duration-300 group`}
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
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="flex flex-col items-center text-center"
                >
                  <div className="w-20 h-20 bg-indigo-100 text-indigo-500 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 group-hover:bg-indigo-200 transition-transform duration-300 shadow-inner">
                    <UploadCloud className="w-10 h-10" />
                  </div>
                  <p className="text-lg font-bold text-slate-700">Click to select a PDF</p>
                  <p className="text-sm text-slate-500 mt-1">or drag and drop it here</p>
                  <p className="text-xs font-medium bg-slate-100 text-slate-500 py-1 px-3 rounded-full mt-4">PDF files only (max 5MB)</p>
                </motion.div>
              ) : (
                <motion.div 
                  key="filled"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex flex-col items-center w-full"
                >
                  <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-200 mb-4 animate-bounce-subtle">
                    <FileText className="w-8 h-8" />
                  </div>
                  <p className="text-lg font-bold text-slate-800 break-all text-center">{file.name}</p>
                  <p className="text-sm text-slate-500 mt-1">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                  <button 
                    type="button" 
                    onClick={(e) => { e.stopPropagation(); setFile(null); }}
                    className="mt-4 text-xs font-semibold text-rose-500 hover:text-rose-700 bg-rose-50 px-3 py-1.5 rounded-full transition-colors"
                  >
                    Remove File
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {error && (
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-rose-500 mt-4 text-sm font-medium flex items-center">
              <AlertCircle className="w-4 h-4 mr-1.5" /> {error}
            </motion.p>
          )}

          <motion.button 
            whileHover={{ scale: file && !loading ? 1.02 : 1 }}
            whileTap={{ scale: file && !loading ? 0.98 : 1 }}
            type="submit" 
            disabled={!file || loading}
            className={`mt-8 w-full max-w-xs py-3.5 rounded-xl font-bold shadow-lg transition-all flex justify-center items-center
              ${!file ? 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none' : 
                loading ? 'bg-indigo-400 text-white cursor-wait opacity-80' : 
                'bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:shadow-indigo-300'}
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
            className="glass-card rounded-2xl p-6 sm:p-8 border border-white/60 shadow-xl shadow-slate-200/50 mt-8"
          >
            <div className="flex items-center mb-6">
              <div className="w-10 h-10 bg-green-100 text-green-600 rounded-full flex items-center justify-center mr-3">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h3 className="text-2xl font-bold text-slate-800">Extraction Successful</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white/50 backdrop-blur-sm p-5 rounded-xl border border-slate-100">
                <h4 className="font-semibold text-slate-700 flex items-center mb-3">
                  <span className="w-2 h-2 rounded-full bg-indigo-500 mr-2"></span>
                  Detected Skills
                </h4>
                <div className="flex flex-wrap gap-2">
                  {resumeData.extractedSkills?.length > 0 ? (
                    resumeData.extractedSkills.map((skill, index) => (
                      <span key={index} className="bg-indigo-50 text-indigo-700 px-3 py-1 rounded-md text-sm font-semibold border border-indigo-100/50 shadow-sm">
                        {skill}
                      </span>
                    ))
                  ) : <span className="text-slate-500 text-sm">No specific core skills matched our current database algorithms.</span>}
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="bg-white/50 backdrop-blur-sm p-5 rounded-xl border border-slate-100">
                  <h4 className="font-semibold text-slate-700 flex items-center mb-2">
                    <span className="w-2 h-2 rounded-full bg-purple-500 mr-2"></span>
                    Education Context
                  </h4>
                  <p className="text-slate-600 text-sm">{resumeData.education}</p>
                </div>
                <div className="bg-white/50 backdrop-blur-sm p-5 rounded-xl border border-slate-100">
                  <h4 className="font-semibold text-slate-700 flex items-center mb-2">
                    <span className="w-2 h-2 rounded-full bg-pink-500 mr-2"></span>
                    Experience Context
                  </h4>
                  <p className="text-slate-600 text-sm">{resumeData.experience}</p>
                </div>
              </div>
            </div>
            
            <div className="mt-8 flex justify-center">
              <Link 
                to="/" 
                className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold px-8 py-3.5 rounded-xl shadow-lg hover:shadow-indigo-500/30 transition-all flex items-center"
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
