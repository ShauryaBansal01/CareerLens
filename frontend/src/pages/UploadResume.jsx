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
      <div
        style={{
          minHeight: 'calc(100vh - 54px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 24,
          background: '#f5f5f7',
        }}
      >
        <div
          style={{
            background: '#fff',
            borderRadius: 20,
            padding: '48px 40px',
            textAlign: 'center',
            maxWidth: 400,
          }}
        >
          <AlertCircle style={{ width: 40, height: 40, color: '#ff3b30', margin: '0 auto 20px' }} />
          <h2 style={{ fontSize: 24, fontWeight: 700, color: '#1d1d1f', letterSpacing: '-0.02em', marginBottom: 8 }}>
            Sign in required
          </h2>
          <p style={{ color: '#6e6e73', fontSize: 15, marginBottom: 28 }}>
            You need to be signed in to upload your resume.
          </p>
          <Link to="/login" className="btn-apple" style={{ textDecoration: 'none', padding: '12px 28px' }}>
            Sign In
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: 'calc(100vh - 54px)',
        background: '#f5f5f7',
        padding: '64px 24px',
      }}
    >
      <div style={{ maxWidth: 680, margin: '0 auto' }}>

        {/* ─── Hero ─── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          style={{ marginBottom: 48 }}
        >
          <h1
            style={{
              fontSize: 40,
              fontWeight: 700,
              color: '#1d1d1f',
              letterSpacing: '-0.03em',
              marginBottom: 10,
            }}
          >
            Upload Your Resume
          </h1>
          <p style={{ fontSize: 17, color: '#6e6e73', fontWeight: 400 }}>
            Our AI analyzes your resume and gives you actionable career insights in seconds.
          </p>
        </motion.div>

        {/* ─── Upload card ─── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.05 }}
          style={{
            background: '#ffffff',
            borderRadius: 20,
            padding: '36px 40px',
            marginBottom: 24,
          }}
        >
          <form onSubmit={handleUpload}>
            {/* Drop zone */}
            <div
              className={`drop-zone ${dragOver ? 'drag-over' : ''}`}
              onClick={() => fileInputRef.current?.click()}
              onDragOver={e => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              style={{ marginBottom: 24 }}
            >
              <input
                type="file"
                accept="application/pdf,.docx,.doc"
                ref={fileInputRef}
                onChange={handleFileChange}
                style={{ display: 'none' }}
              />
              <AnimatePresence mode="wait">
                {!file ? (
                  <motion.div
                    key="empty"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    style={{ textAlign: 'center' }}
                  >
                    <UploadCloud
                      style={{
                        width: 40,
                        height: 40,
                        color: '#aeaeb2',
                        margin: '0 auto 16px',
                        strokeWidth: 1.5,
                      }}
                    />
                    <p style={{ fontSize: 16, fontWeight: 600, color: '#1d1d1f', letterSpacing: '-0.01em', marginBottom: 4 }}>
                      Drag &amp; drop your resume here
                    </p>
                    <p style={{ fontSize: 14, color: '#6e6e73' }}>or click to browse files</p>
                    <p style={{ fontSize: 12, color: '#aeaeb2', marginTop: 16 }}>Max 5 MB</p>
                  </motion.div>
                ) : (
                  <motion.div
                    key="filled"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    style={{ textAlign: 'center' }}
                  >
                    <FileText
                      style={{
                        width: 40,
                        height: 40,
                        color: '#0071e3',
                        margin: '0 auto 14px',
                        strokeWidth: 1.5,
                      }}
                    />
                    <p style={{ fontSize: 15, fontWeight: 600, color: '#1d1d1f', marginBottom: 4 }}>
                      {file.name}
                    </p>
                    <p style={{ fontSize: 13, color: '#6e6e73', marginBottom: 16 }}>
                      {(file.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                    <button
                      type="button"
                      onClick={e => { e.stopPropagation(); setFile(null); }}
                      style={{
                        fontSize: 13,
                        color: '#ff3b30',
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        fontWeight: 500,
                      }}
                    >
                      Remove file
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* File format pills */}
            <div style={{ display: 'flex', gap: 8, marginBottom: 32, flexWrap: 'wrap' }}>
              {['PDF', 'DOCX', 'DOC'].map(fmt => (
                <span key={fmt} className="apple-pill-gray" style={{ fontSize: 12 }}>{fmt}</span>
              ))}
            </div>

            {/* Error */}
            {error && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  fontSize: 14,
                  color: '#c0392b',
                  marginBottom: 16,
                  background: 'rgba(255,59,48,0.07)',
                  padding: '10px 14px',
                  borderRadius: 10,
                }}
              >
                <AlertCircle style={{ width: 15, height: 15, flexShrink: 0 }} />
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
                <span style={{ display: 'flex', alignItems: 'center', gap: 10, justifyContent: 'center' }}>
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
              style={{
                background: '#ffffff',
                borderRadius: 20,
                padding: '36px 40px',
              }}
            >
              {/* Success header */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 28 }}>
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: '50%',
                    background: 'rgba(52,199,89,0.12)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <CheckCircle style={{ width: 20, height: 20, color: '#34c759' }} />
                </div>
                <div>
                  <h3 style={{ fontSize: 21, fontWeight: 600, color: '#1d1d1f', letterSpacing: '-0.02em' }}>
                    Analysis complete
                  </h3>
                  <p style={{ fontSize: 13, color: '#6e6e73', marginTop: 2 }}>
                    Your resume has been successfully processed.
                  </p>
                </div>
              </div>

              <hr className="apple-sep" style={{ marginBottom: 28 }} />

              {/* Skills */}
              <div style={{ marginBottom: 28 }}>
                <p style={{ fontSize: 12, fontWeight: 600, color: '#6e6e73', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 14 }}>
                  Detected Skills
                </p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {resumeData.extractedSkills?.length > 0
                    ? resumeData.extractedSkills.map((skill, i) => (
                        <span key={i} className="skill-tag">{skill}</span>
                      ))
                    : <span style={{ fontSize: 14, color: '#aeaeb2' }}>No specific skills detected.</span>
                  }
                </div>
              </div>

              {/* Education & Experience */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 32 }}>
                <div style={{ background: '#f5f5f7', borderRadius: 14, padding: '20px 22px' }}>
                  <p style={{ fontSize: 12, fontWeight: 600, color: '#6e6e73', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 10 }}>
                    Education
                  </p>
                  <p style={{ fontSize: 14, color: '#1d1d1f', lineHeight: 1.6 }}>
                    {resumeData.education || 'Not detected'}
                  </p>
                </div>
                <div style={{ background: '#f5f5f7', borderRadius: 14, padding: '20px 22px' }}>
                  <p style={{ fontSize: 12, fontWeight: 600, color: '#6e6e73', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 10 }}>
                    Experience
                  </p>
                  <p style={{ fontSize: 14, color: '#1d1d1f', lineHeight: 1.6 }}>
                    {resumeData.experience || 'Not detected'}
                  </p>
                </div>
              </div>

              {/* CTA */}
              <Link
                to="/"
                className="btn-apple"
                style={{ textDecoration: 'none', padding: '12px 28px', fontSize: 15 }}
              >
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
