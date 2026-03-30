import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Editor from '@monaco-editor/react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Download, Save, Sparkles, FileText, CheckCircle2, AlertCircle, X, Plus, Trash2 } from 'lucide-react';

const ResumeLatex = () => {
  const [latexCode, setLatexCode] = useState('');
  const [pdfUrl, setPdfUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [compiling, setCompiling] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState(''); // 'success' or 'error'
  
  // Wizard State
  const [showWizard, setShowWizard] = useState(false);
  const [resumeData, setResumeData] = useState({
    personalInfo: { name: "", email: "", phone: "", linkedin: "", github: "" },
    summary: "",
    education: [{ school: "", degree: "", dates: "" }],
    experience: [{ company: "", role: "", dates: "", bulletPoints: "" }],
    projects: [{ name: "", techStack: "", description: "" }],
    skills: "",
    enhanceWithAI: true
  });

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

  const openWizard = async () => {
    setShowWizard(true);
    try {
      const token = localStorage.getItem('token');
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const { data } = await axios.get('http://localhost:5000/api/resume/', config);
      
      if (data) {
        setResumeData(prev => ({
          ...prev,
          skills: data.extractedSkills ? data.extractedSkills.join(', ') : prev.skills,
          // Since existing education/experience are raw text blocks, we can map them roughly into the first block
          education: [{ school: "From Profile", degree: data.education || "", dates: "" }],
          experience: [{ company: "From Profile", role: "", dates: "", bulletPoints: data.experience || "" }]
        }));
      }
    } catch (error) {
      console.log("No existing profile data found to prefill.");
    }
  };

  const handleGenerate = async () => {
    setLoading(true);
    setShowWizard(false); // Close modal while loading
    try {
      const token = localStorage.getItem('token');
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const { data } = await axios.post('http://localhost:5000/api/resume/latex/generate', { resumeData }, config);
      setLatexCode(data.rawLatexCode);
      showToast('Generated successfully with AI Magic!');
    } catch (error) {
      showToast('Failed to generate resume.', 'error');
    }
    setLoading(false);
  };

  const compilePdf = () => {
    setCompiling(true);
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

  // Handlers for Wizard dynamic arrays
  const addExperience = () => setResumeData({...resumeData, experience: [...resumeData.experience, { company: "", role: "", dates: "", bulletPoints: "" }]});
  const updateExperience = (index, field, value) => {
    const newExp = [...resumeData.experience];
    newExp[index][field] = value;
    setResumeData({...resumeData, experience: newExp});
  };
  const removeExperience = (index) => setResumeData({...resumeData, experience: resumeData.experience.filter((_, i) => i !== index)});

  const addProject = () => setResumeData({...resumeData, projects: [...resumeData.projects, { name: "", techStack: "", description: "" }]});
  const updateProject = (index, field, value) => {
    const newProj = [...resumeData.projects];
    newProj[index][field] = value;
    setResumeData({...resumeData, projects: newProj});
  };
  const removeProject = (index) => setResumeData({...resumeData, projects: resumeData.projects.filter((_, i) => i !== index)});

  const addEducation = () => setResumeData({...resumeData, education: [...resumeData.education, { school: "", degree: "", dates: "" }]});
  const updateEducation = (index, field, value) => {
    const newEdu = [...resumeData.education];
    newEdu[index][field] = value;
    setResumeData({...resumeData, education: newEdu});
  };
  const removeEducation = (index) => setResumeData({...resumeData, education: resumeData.education.filter((_, i) => i !== index)});

  return (
    <div className="h-[calc(100vh-54px)] flex flex-col bg-[#f5f5f7] overflow-hidden relative">
      
      {/* Wizard Modal */}
      <AnimatePresence>
        {showWizard && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden"
            >
              <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                <div>
                  <h2 className="text-xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
                    <Sparkles className="text-purple-500" size={20} />
                    AI Resume Wizard
                  </h2>
                  <p className="text-sm text-gray-500 mt-1">Provide your details, and our AI will rewrite and format a brilliant LaTeX resume.</p>
                </div>
                <button onClick={() => setShowWizard(false)} className="p-2 hover:bg-gray-200 rounded-full transition-colors text-gray-500">
                  <X size={20} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">
                {/* Personal Info */}
                <section>
                  <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4 border-b pb-2">Personal Information</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <input className="apple-input bg-gray-50 text-sm" placeholder="Full Name" value={resumeData.personalInfo.name} onChange={e => setResumeData({...resumeData, personalInfo: {...resumeData.personalInfo, name: e.target.value}})} />
                    <input className="apple-input bg-gray-50 text-sm" placeholder="Email" value={resumeData.personalInfo.email} onChange={e => setResumeData({...resumeData, personalInfo: {...resumeData.personalInfo, email: e.target.value}})} />
                    <input className="apple-input bg-gray-50 text-sm" placeholder="Phone" value={resumeData.personalInfo.phone} onChange={e => setResumeData({...resumeData, personalInfo: {...resumeData.personalInfo, phone: e.target.value}})} />
                    <input className="apple-input bg-gray-50 text-sm" placeholder="LinkedIn URL" value={resumeData.personalInfo.linkedin} onChange={e => setResumeData({...resumeData, personalInfo: {...resumeData.personalInfo, linkedin: e.target.value}})} />
                    <input className="apple-input bg-gray-50 text-sm col-span-2" placeholder="GitHub / Portfolio URL" value={resumeData.personalInfo.github} onChange={e => setResumeData({...resumeData, personalInfo: {...resumeData.personalInfo, github: e.target.value}})} />
                  </div>
                </section>

                {/* Skills */}
                <section>
                  <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4 border-b pb-2">Skills</h3>
                  <textarea className="apple-input bg-gray-50 text-sm min-h-[80px]" placeholder="React, Node.js, Python, AWS (comma separated)" value={resumeData.skills} onChange={e => setResumeData({...resumeData, skills: e.target.value})} />
                </section>

                {/* Experience */}
                <section>
                  <div className="flex justify-between items-end border-b pb-2 mb-4">
                    <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">Experience</h3>
                    <button onClick={addExperience} className="text-blue-600 text-xs font-medium flex items-center gap-1 hover:text-blue-700"><Plus size={14}/> Add Job</button>
                  </div>
                  <div className="space-y-6">
                    {resumeData.experience.map((exp, index) => (
                      <div key={index} className="p-4 border border-gray-100 rounded-xl bg-gray-50/50 relative group">
                        <button onClick={() => removeExperience(index)} className="absolute top-3 right-3 text-red-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 size={16} /></button>
                        <div className="grid grid-cols-2 gap-3 mb-3">
                          <input className="apple-input bg-white text-sm" placeholder="Company Name" value={exp.company} onChange={e => updateExperience(index, 'company', e.target.value)} />
                          <input className="apple-input bg-white text-sm" placeholder="Role / Title" value={exp.role} onChange={e => updateExperience(index, 'role', e.target.value)} />
                          <input className="apple-input bg-white text-sm col-span-2" placeholder="Dates (e.g., Jan 2021 - Present)" value={exp.dates} onChange={e => updateExperience(index, 'dates', e.target.value)} />
                        </div>
                        <textarea className="apple-input bg-white text-sm min-h-[100px]" placeholder="Rough notes on what you did... AI will enhance this into STAR bullet points!" value={exp.bulletPoints} onChange={e => updateExperience(index, 'bulletPoints', e.target.value)} />
                      </div>
                    ))}
                  </div>
                </section>

                {/* Projects */}
                <section>
                  <div className="flex justify-between items-end border-b pb-2 mb-4">
                    <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">Projects</h3>
                    <button onClick={addProject} className="text-blue-600 text-xs font-medium flex items-center gap-1 hover:text-blue-700"><Plus size={14}/> Add Project</button>
                  </div>
                  <div className="space-y-6">
                    {resumeData.projects.map((proj, index) => (
                      <div key={index} className="p-4 border border-gray-100 rounded-xl bg-gray-50/50 relative group">
                        <button onClick={() => removeProject(index)} className="absolute top-3 right-3 text-red-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 size={16} /></button>
                        <div className="grid grid-cols-2 gap-3 mb-3">
                          <input className="apple-input bg-white text-sm" placeholder="Project Name" value={proj.name} onChange={e => updateProject(index, 'name', e.target.value)} />
                          <input className="apple-input bg-white text-sm" placeholder="Tech Stack (e.g., React, Firebase)" value={proj.techStack} onChange={e => updateProject(index, 'techStack', e.target.value)} />
                        </div>
                        <textarea className="apple-input bg-white text-sm min-h-[80px]" placeholder="Rough notes on the project... AI will enhance this!" value={proj.description} onChange={e => updateProject(index, 'description', e.target.value)} />
                      </div>
                    ))}
                  </div>
                </section>
                
                {/* Education */}
                <section>
                  <div className="flex justify-between items-end border-b pb-2 mb-4">
                    <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">Education</h3>
                    <button onClick={addEducation} className="text-blue-600 text-xs font-medium flex items-center gap-1 hover:text-blue-700"><Plus size={14}/> Add Education</button>
                  </div>
                  <div className="space-y-4">
                    {resumeData.education.map((edu, index) => (
                      <div key={index} className="p-4 border border-gray-100 rounded-xl bg-gray-50/50 relative group flex gap-3">
                        <button onClick={() => removeEducation(index)} className="absolute top-3 right-3 text-red-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 size={16} /></button>
                        <input className="apple-input bg-white text-sm w-1/3" placeholder="School/University" value={edu.school} onChange={e => updateEducation(index, 'school', e.target.value)} />
                        <input className="apple-input bg-white text-sm w-1/3" placeholder="Degree (e.g., BS Computer Science)" value={edu.degree} onChange={e => updateEducation(index, 'degree', e.target.value)} />
                        <input className="apple-input bg-white text-sm w-1/3 mr-6" placeholder="Dates/Graduation" value={edu.dates} onChange={e => updateEducation(index, 'dates', e.target.value)} />
                      </div>
                    ))}
                  </div>
                </section>
              </div>

              <div className="p-5 border-t border-gray-200 bg-white flex items-center justify-between">
                <label className="flex items-center gap-3 cursor-pointer group">
                  <div className="relative flex items-center">
                    <input type="checkbox" className="sr-only" checked={resumeData.enhanceWithAI} onChange={(e) => setResumeData({...resumeData, enhanceWithAI: e.target.checked})} />
                    <div className={`w-11 h-6 rounded-full transition-colors ${resumeData.enhanceWithAI ? 'bg-purple-500' : 'bg-gray-300'}`}></div>
                    <div className={`absolute w-4 h-4 bg-white rounded-full transition-transform transform ${resumeData.enhanceWithAI ? 'translate-x-6' : 'translate-x-1'} top-1`}></div>
                  </div>
                  <span className="text-sm font-medium text-gray-800 flex items-center gap-1.5">
                    <Sparkles size={16} className={resumeData.enhanceWithAI ? "text-purple-500" : "text-gray-400"} />
                    Enhance bullet points with AI
                  </span>
                </label>
                
                <div className="flex gap-3">
                  <button onClick={() => setShowWizard(false)} className="px-5 py-2.5 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-100 transition-colors">Cancel</button>
                  <button onClick={handleGenerate} className="px-6 py-2.5 rounded-xl text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 transition-all shadow-md flex items-center gap-2">
                    Generate Resume
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

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
            onClick={openWizard} 
            disabled={loading}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-full text-[13px] font-medium bg-purple-50 text-purple-700 hover:bg-purple-100 transition-colors disabled:opacity-50 border border-purple-100 shadow-sm"
          >
            {loading ? (
              <div className="w-3.5 h-3.5 border-2 border-purple-700 border-t-transparent rounded-full animate-spin" />
            ) : (
              <Sparkles size={14} />
            )}
            AI Resume Wizard
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