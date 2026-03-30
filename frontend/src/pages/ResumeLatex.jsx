import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Editor from '@monaco-editor/react';
import { motion } from 'framer-motion';
import { Play, Download, Save, Sparkles, FileText, CheckCircle2, AlertCircle } from 'lucide-react';

const ResumeLatex = () => {
  const [latexCode, setLatexCode] = useState('');
  const [pdfUrl, setPdfUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [compiling, setCompiling] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState(''); // 'success' or 'error'

  useEffect(() => {
    const fetchLatex = async () => {
      try {
        const token = localStorage.getItem('token');
        if (token) {
          const config = { headers: { Authorization: `Bearer ${token}` } };
          const { data } = await axios.get('http://localhost:5000/api/resume/latex', config);
          if (data.rawLatexCode) {
            setLatexCode(data.rawLatexCode);
          } else {
            setLatexCode('% Start writing your LaTeX resume here!\n\\documentclass{article}\n\\begin{document}\nHello World\n\\end{document}');
          }
        }
      } catch (error) {
        console.error('Failed to fetch LaTeX code', error);
      }
    };
    fetchLatex();
  }, []);

  const handleEditorChange = (value) => {
    setLatexCode(value);
  };

  const showToast = (msg, type = 'success') => {
    setMessage(msg);
    setMessageType(type);
    setTimeout(() => setMessage(''), 3000);
  };

  const saveLatex = async () => {
    setSaving(true);
    try {
      const token = localStorage.getItem('token');
      const config = { headers: { Authorization: `Bearer ${token}` } };
      await axios.post('http://localhost:5000/api/resume/latex', { rawLatexCode: latexCode }, config);
      showToast('Code saved successfully');
    } catch (error) {
      showToast('Failed to save code', 'error');
    }
    setSaving(false);
  };

  const generateFromProfile = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const { data } = await axios.post('http://localhost:5000/api/resume/latex/generate', {}, config);
      setLatexCode(data.rawLatexCode);
      showToast('Generated successfully from your profile');
    } catch (error) {
      showToast('Failed to generate from profile. Ensure you uploaded a resume first.', 'error');
    }
    setLoading(false);
  };

  const compilePdf = () => {
    setCompiling(true);
    // Add a slight delay to show loading state since the iframe load can't be easily tracked cross-origin
    setTimeout(() => setCompiling(false), 1500); 
    const encoded = encodeURIComponent(latexCode);
    const url = `https://latexonline.cc/compile?text=${encoded}&force=true`;
    setPdfUrl(url);
  };

  const downloadTex = () => {
    const element = document.createElement("a");
    const file = new Blob([latexCode], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = "resume.tex";
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    showToast('Downloaded .tex file');
  };

  return (
    <div className="h-[calc(100vh-54px)] flex flex-col bg-[#f5f5f7] overflow-hidden">
      {/* Top Toolbar */}
      <header className="bg-white border-b border-gray-200 px-6 py-3 flex justify-between items-center z-10 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
            <FileText size={18} strokeWidth={2.5} />
          </div>
          <div>
            <h1 className="text-[17px] font-semibold text-[#1d1d1f] tracking-tight leading-none">LaTeX Editor</h1>
            <p className="text-[12px] text-[#6e6e73] mt-0.5">Build ATS-friendly PDFs directly in your browser</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {message && (
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0 }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium mr-2 ${
                messageType === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
              }`}
            >
              {messageType === 'success' ? <CheckCircle2 size={14} /> : <AlertCircle size={14} />}
              {message}
            </motion.div>
          )}

          <button 
            onClick={generateFromProfile} 
            disabled={loading}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[13px] font-medium bg-[#f5f5f7] text-[#1d1d1f] hover:bg-[#e8e8ea] transition-colors disabled:opacity-50"
          >
            {loading ? (
              <div className="w-3.5 h-3.5 border-2 border-[#1d1d1f] border-t-transparent rounded-full animate-spin" />
            ) : (
              <Sparkles size={14} className="text-purple-500" />
            )}
            AI Generate
          </button>
          
          <div className="w-px h-4 bg-gray-300 mx-1" />

          <button 
            onClick={saveLatex} 
            disabled={saving}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[13px] font-medium bg-[#f5f5f7] text-[#1d1d1f] hover:bg-[#e8e8ea] transition-colors disabled:opacity-50"
          >
            <Save size={14} />
            {saving ? 'Saving...' : 'Save'}
          </button>

          <button 
            onClick={downloadTex} 
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[13px] font-medium bg-[#f5f5f7] text-[#1d1d1f] hover:bg-[#e8e8ea] transition-colors"
          >
            <Download size={14} />
            .tex
          </button>

          <button 
            onClick={compilePdf} 
            disabled={compiling}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-full text-[13px] font-medium bg-[#0071e3] text-white hover:bg-[#0077ed] transition-colors shadow-sm ml-1 disabled:opacity-80"
          >
            {compiling ? (
              <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <Play size={14} fill="currentColor" className="ml-0.5" />
            )}
            Compile
          </button>
        </div>
      </header>

      {/* Main Workspace */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Pane: Editor */}
        <div className="w-1/2 h-full border-r border-gray-200 bg-[#1e1e1e] flex flex-col">
          <div className="bg-[#2d2d2d] text-[#858585] text-[11px] px-4 py-1.5 font-mono border-b border-[#1e1e1e] flex justify-between">
            <span>resume.tex</span>
            <span>LaTeX</span>
          </div>
          <div className="flex-1 pt-2">
            <Editor
              height="100%"
              defaultLanguage="latex"
              theme="vs-dark"
              value={latexCode}
              onChange={handleEditorChange}
              options={{
                wordWrap: 'on',
                minimap: { enabled: false },
                fontSize: 13,
                fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
                lineHeight: 24,
                padding: { top: 8 },
                scrollBeyondLastLine: false,
                smoothScrolling: true,
                cursorBlinking: "smooth",
              }}
            />
          </div>
        </div>

        {/* Right Pane: Preview */}
        <div className="w-1/2 h-full bg-[#525659] flex flex-col relative">
          <div className="bg-[#323639] text-[#b3b3b3] text-[11px] px-4 py-1.5 font-sans border-b border-[#2b2b2b] shadow-sm z-10">
            Preview.pdf
          </div>
          
          <div className="flex-1 overflow-hidden flex items-center justify-center relative">
            {pdfUrl ? (
              <iframe 
                src={pdfUrl} 
                className="w-full h-full border-none bg-white"
                title="PDF Preview"
              />
            ) : (
              <div className="text-[#a0a0a0] flex flex-col items-center max-w-xs text-center">
                <div className="w-16 h-16 mb-4 rounded-2xl bg-[#404346] flex items-center justify-center border border-[#5c5f62] shadow-inner">
                  <Play size={24} className="text-[#8e8e8e] ml-1" />
                </div>
                <h3 className="text-white font-medium text-lg mb-1">No Preview Available</h3>
                <p className="text-[13px] leading-relaxed">
                  Write your LaTeX code on the left and click Compile to generate your PDF preview.
                </p>
              </div>
            )}
            
            {/* Compiling Overlay Overlay */}
            {compiling && (
              <div className="absolute inset-0 bg-[#525659]/80 backdrop-blur-sm flex flex-col items-center justify-center z-20">
                 <div className="w-10 h-10 border-3 border-[#0071e3] border-t-transparent rounded-full animate-spin mb-4" />
                 <p className="text-white font-medium text-sm">Compiling document...</p>
                 <p className="text-[#b3b3b3] text-xs mt-1">Connecting to compiler engine</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResumeLatex;