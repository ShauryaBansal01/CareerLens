import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Editor from '@monaco-editor/react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Download, Save, Sparkles, FileText, CheckCircle2, AlertCircle, X, Plus, Trash2, Target } from 'lucide-react';

import AuthContext from '../context/AuthContext';
import { useContext } from 'react';

const ResumeLatex = () => {
  const { user } = useContext(AuthContext);
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

  // Tailor State
  const [showTailorWizard, setShowTailorWizard] = useState(false);
  const [jobDescriptionText, setJobDescriptionText] = useState('');
  const [tailoring, setTailoring] = useState(false);

  // Versioning State
  const [versions, setVersions] = useState([]);
  const [activeVersionId, setActiveVersionId] = useState('');
  const [showSaveAsModal, setShowSaveAsModal] = useState(false);
  const [saveAsTitle, setSaveAsTitle] = useState('');
  
  // Tailor Extra Fields
  const [tailorVersionTitle, setTailorVersionTitle] = useState('');
  const [targetCompany, setTargetCompany] = useState('');

  const fetchVersions = async () => {
    if (!user) return;
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const { data } = await axios.get('http://localhost:5000/api/resume/versions', config);
      
      if (data && data.length > 0) {
        setVersions(data);
        await loadVersion(data[0]._id, config);
      } else {
        // Fallback to legacy GET /latex
        const legacy = await axios.get('http://localhost:5000/api/resume/latex', config);
        if (legacy.data.rawLatexCode) {
          // Auto migrate
          const res = await axios.post('http://localhost:5000/api/resume/versions', {
            title: 'Base Resume',
            rawLatexCode: legacy.data.rawLatexCode,
            isBaseResume: true
          }, config);
          setVersions([res.data]);
          setLatexCode(res.data.rawLatexCode);
          setActiveVersionId(res.data._id);
        } else {
          setLatexCode('% Start writing your LaTeX resume here!\n\\documentclass{article}\n\\begin{document}\nHello World\n\\end{document}');
        }
      }
    } catch (error) {
      console.error('Failed to fetch versions', error);
    }
  };

  const loadVersion = async (id, configObj = null) => {
    try {
      const config = configObj || { headers: { Authorization: `Bearer ${user.token}` } };
      const { data } = await axios.get(`http://localhost:5000/api/resume/versions/${id}`, config);
      setLatexCode(data.rawLatexCode);
      setActiveVersionId(id);
      setPdfUrl(''); // reset preview
    } catch (error) {
      showToast('Failed to load version', 'error');
    }
  };

  useEffect(() => {
    fetchVersions();
  }, [user]);

  const handleEditorChange = (value) => {
    setLatexCode(value);
  };

  const showToast = (msg, type = 'success') => {
    setMessage(msg);
    setMessageType(type);
    setTimeout(() => setMessage(''), 3000);
  };

  const saveLatex = async () => {
    if (!user) return;
    setSaving(true);
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      if (activeVersionId) {
        await axios.put(`http://localhost:5000/api/resume/versions/${activeVersionId}`, { rawLatexCode: latexCode }, config);
        const updatedVersions = versions.map(v => v._id === activeVersionId ? { ...v, rawLatexCode: latexCode } : v);
        setVersions(updatedVersions);
        showToast('Version saved successfully');
      } else {
        const { data } = await axios.post('http://localhost:5000/api/resume/versions', { title: 'Untitled Version', rawLatexCode: latexCode }, config);
        setVersions([data, ...versions]);
        setActiveVersionId(data._id);
        showToast('Created and saved successfully');
      }
    } catch (error) {
      showToast('Failed to save code', 'error');
    }
    setSaving(false);
  };

  const saveAsNewVersion = async () => {
    if (!user || !saveAsTitle.trim()) return;
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const { data } = await axios.post('http://localhost:5000/api/resume/versions', { 
        title: saveAsTitle, 
        rawLatexCode: latexCode 
      }, config);
      setVersions([data, ...versions]);
      setActiveVersionId(data._id);
      setShowSaveAsModal(false);
      setSaveAsTitle('');
      showToast(`Saved as "${data.title}"`);
    } catch (error) {
      showToast('Failed to save as new version', 'error');
    }
  };

  const deleteVersion = async (id, e) => {
    e.stopPropagation();
    if (!window.confirm("Are you sure you want to delete this version?")) return;
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      await axios.delete(`http://localhost:5000/api/resume/versions/${id}`, config);
      const newVersions = versions.filter(v => v._id !== id);
      setVersions(newVersions);
      if (activeVersionId === id) {
         if (newVersions.length > 0) loadVersion(newVersions[0]._id, config);
         else {
           setActiveVersionId('');
           setLatexCode('');
         }
      }
      showToast('Version deleted');
    } catch (error) {
      showToast('Failed to delete', 'error');
    }
  };

  const openWizard = async () => {
    if (!user) return;
    setShowWizard(true);
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
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
    if (!user) return;
    setLoading(true);
    setShowWizard(false); // Close modal while loading
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const { data } = await axios.post('http://localhost:5000/api/resume/latex/generate', { resumeData }, config);
      setLatexCode(data.rawLatexCode);
      showToast('Generated successfully with AI Magic!');
    } catch (error) {
      showToast('Failed to generate resume.', 'error');
    }
    setLoading(false);
  };

  const handleTailorJob = async () => {
    if (!user) return;
    if (!jobDescriptionText || jobDescriptionText.trim().length < 20) {
      showToast('Please provide a valid job description (min 20 chars)', 'error');
      return;
    }
    if (!tailorVersionTitle.trim()) {
      showToast('Please provide a version title', 'error');
      return;
    }
    setTailoring(true);
    setShowTailorWizard(false);
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const { data } = await axios.post('http://localhost:5000/api/resume/latex/tailor', { jobDescription: jobDescriptionText }, config);
      setLatexCode(data.rawLatexCode);
      
      const res = await axios.post('http://localhost:5000/api/resume/versions', { 
        title: tailorVersionTitle, 
        targetCompany: targetCompany,
        targetJobDescription: jobDescriptionText,
        rawLatexCode: data.rawLatexCode 
      }, config);
      
      setVersions([res.data, ...versions]);
      setActiveVersionId(res.data._id);

      showToast('Tailored and saved as new version!');
      setJobDescriptionText('');
      setTailorVersionTitle('');
      setTargetCompany('');
    } catch (error) {
      showToast(error.response?.data?.message || 'Failed to tailor resume.', 'error');
    }
    setTailoring(false);
  };

  const compilePdf = async () => {
    setCompiling(true);
    
    // Instead of sending the full text in the URL which causes 414 URI Too Large,
    // we use texlive.net's POST endpoint via a hidden form and iframe.
    
    try {
      // We need a form to POST the data to texlive to avoid 414 error
      const form = document.createElement('form');
      form.method = 'POST';
      form.action = 'https://texlive.net/cgi-bin/latexcgi';
      form.target = 'pdf-preview-iframe'; // Target the iframe
      form.enctype = 'multipart/form-data';

      // texlive.net requires specific fields
      const filecontents = document.createElement('input');
      filecontents.type = 'hidden';
      filecontents.name = 'filecontents[]';
      filecontents.value = latexCode;

      const filename = document.createElement('input');
      filename.type = 'hidden';
      filename.name = 'filename[]';
      filename.value = 'document.tex';

      const engine = document.createElement('input');
      engine.type = 'hidden';
      engine.name = 'engine';
      engine.value = 'pdflatex';

      const returnType = document.createElement('input');
      returnType.type = 'hidden';
      returnType.name = 'return';
      returnType.value = 'pdf';

      form.appendChild(filecontents);
      form.appendChild(filename);
      form.appendChild(engine);
      form.appendChild(returnType);
      
      document.body.appendChild(form);

      // Submit the form which will load the result into the iframe
      form.submit();
      
      // Cleanup
      document.body.removeChild(form);
      
      // We mark pdfUrl as 'compiled' so the UI knows we have something in the iframe
      setPdfUrl('compiled'); 
      
      // Give the compiler some time before hiding the overlay
      setTimeout(() => setCompiling(false), 3000); 
    } catch (error) {
      console.error(error);
      setCompiling(false);
      showToast('Compilation failed to start', 'error');
    }
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
    <div className="h-[calc(100vh-54px)] flex flex-col bg-gray-50 dark:bg-dark-surface overflow-hidden relative">
      
      {/* Wizard Modal */}
      <AnimatePresence>
        {showWizard && (
          <div className="fixed inset-0 bg-black/40 dark:bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="bg-white dark:bg-dark-card rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden border border-white/10 dark:border-white/5"
            >
              <div className="px-6 py-4 border-b border-gray-100 dark:border-white/5 flex justify-between items-center bg-gray-50/50 dark:bg-dark-card/50">
                <div>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white tracking-tight flex items-center gap-2">
                    <Sparkles className="text-purple-500" size={20} />
                    AI Resume Wizard
                  </h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Provide your details, and our AI will rewrite and format a brilliant LaTeX resume.</p>
                </div>
                <button onClick={() => setShowWizard(false)} className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full transition-colors text-gray-500 dark:text-gray-400">
                  <X size={20} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">
                {/* Personal Info */}
                <section>
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wider mb-4 border-b border-white/10 dark:border-white/5 pb-2">Personal Information</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <input className="apple-input bg-gray-50 dark:bg-dark-surface w-full text-sm" placeholder="Full Name" value={resumeData.personalInfo.name} onChange={e => setResumeData({...resumeData, personalInfo: {...resumeData.personalInfo, name: e.target.value}})} />
                    <input className="apple-input bg-gray-50 dark:bg-dark-surface w-full text-sm" placeholder="Email" value={resumeData.personalInfo.email} onChange={e => setResumeData({...resumeData, personalInfo: {...resumeData.personalInfo, email: e.target.value}})} />
                    <input className="apple-input bg-gray-50 dark:bg-dark-surface w-full text-sm" placeholder="Phone" value={resumeData.personalInfo.phone} onChange={e => setResumeData({...resumeData, personalInfo: {...resumeData.personalInfo, phone: e.target.value}})} />
                    <input className="apple-input bg-gray-50 dark:bg-dark-surface w-full text-sm" placeholder="LinkedIn URL" value={resumeData.personalInfo.linkedin} onChange={e => setResumeData({...resumeData, personalInfo: {...resumeData.personalInfo, linkedin: e.target.value}})} />
                    <input className="apple-input bg-gray-50 dark:bg-dark-surface w-full text-sm col-span-2" placeholder="GitHub / Portfolio URL" value={resumeData.personalInfo.github} onChange={e => setResumeData({...resumeData, personalInfo: {...resumeData.personalInfo, github: e.target.value}})} />
                  </div>
                </section>

                {/* Skills */}
                <section>
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wider mb-4 border-b border-white/10 dark:border-white/5 pb-2">Skills</h3>
                  <textarea className="apple-input bg-gray-50 dark:bg-dark-surface w-full text-sm min-h-[80px]" placeholder="React, Node.js, Python, AWS (comma separated)" value={resumeData.skills} onChange={e => setResumeData({...resumeData, skills: e.target.value})} />
                </section>

                {/* Experience */}
                <section>
                  <div className="flex justify-between items-end border-b border-white/10 dark:border-white/5 pb-2 mb-4">
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wider">Experience</h3>
                    <button onClick={addExperience} className="text-blue-600 dark:text-blue-400 text-xs font-medium flex items-center gap-1 hover:text-blue-700 dark:hover:text-blue-300"><Plus size={14}/> Add Job</button>
                  </div>
                  <div className="space-y-6">
                    {resumeData.experience.map((exp, index) => (
                      <div key={index} className="p-4 border border-gray-100 dark:border-white/5 rounded-xl bg-gray-50/50 dark:bg-dark-surface/50 relative group">
                        <button onClick={() => removeExperience(index)} className="absolute top-3 right-3 text-red-400 hover:text-red-600 dark:hover:text-red-300 opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 size={16} /></button>
                        <div className="grid grid-cols-2 gap-3 mb-3">
                          <input className="apple-input bg-white dark:bg-dark-card w-full text-sm" placeholder="Company Name" value={exp.company} onChange={e => updateExperience(index, 'company', e.target.value)} />
                          <input className="apple-input bg-white dark:bg-dark-card w-full text-sm" placeholder="Role / Title" value={exp.role} onChange={e => updateExperience(index, 'role', e.target.value)} />
                          <input className="apple-input bg-white dark:bg-dark-card w-full text-sm col-span-2" placeholder="Dates (e.g., Jan 2021 - Present)" value={exp.dates} onChange={e => updateExperience(index, 'dates', e.target.value)} />
                        </div>
                        <textarea className="apple-input bg-white dark:bg-dark-card w-full text-sm min-h-[100px]" placeholder="Rough notes on what you did... AI will enhance this into STAR bullet points!" value={exp.bulletPoints} onChange={e => updateExperience(index, 'bulletPoints', e.target.value)} />
                      </div>
                    ))}
                  </div>
                </section>

                {/* Projects */}
                <section>
                  <div className="flex justify-between items-end border-b border-white/10 dark:border-white/5 pb-2 mb-4">
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wider">Projects</h3>
                    <button onClick={addProject} className="text-blue-600 dark:text-blue-400 text-xs font-medium flex items-center gap-1 hover:text-blue-700 dark:hover:text-blue-300"><Plus size={14}/> Add Project</button>
                  </div>
                  <div className="space-y-6">
                    {resumeData.projects.map((proj, index) => (
                      <div key={index} className="p-4 border border-gray-100 dark:border-white/5 rounded-xl bg-gray-50/50 dark:bg-dark-surface/50 relative group">
                        <button onClick={() => removeProject(index)} className="absolute top-3 right-3 text-red-400 hover:text-red-600 dark:hover:text-red-300 opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 size={16} /></button>
                        <div className="grid grid-cols-2 gap-3 mb-3">
                          <input className="apple-input bg-white dark:bg-dark-card w-full text-sm" placeholder="Project Name" value={proj.name} onChange={e => updateProject(index, 'name', e.target.value)} />
                          <input className="apple-input bg-white dark:bg-dark-card w-full text-sm" placeholder="Tech Stack (e.g., React, Firebase)" value={proj.techStack} onChange={e => updateProject(index, 'techStack', e.target.value)} />
                        </div>
                        <textarea className="apple-input bg-white dark:bg-dark-card w-full text-sm min-h-[80px]" placeholder="Rough notes on the project... AI will enhance this!" value={proj.description} onChange={e => updateProject(index, 'description', e.target.value)} />
                      </div>
                    ))}
                  </div>
                </section>
                
                {/* Education */}
                <section>
                  <div className="flex justify-between items-end border-b border-white/10 dark:border-white/5 pb-2 mb-4">
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wider">Education</h3>
                    <button onClick={addEducation} className="text-blue-600 dark:text-blue-400 text-xs font-medium flex items-center gap-1 hover:text-blue-700 dark:hover:text-blue-300"><Plus size={14}/> Add Education</button>
                  </div>
                  <div className="space-y-4">
                    {resumeData.education.map((edu, index) => (
                      <div key={index} className="p-4 border border-gray-100 dark:border-white/5 rounded-xl bg-gray-50/50 dark:bg-dark-surface/50 relative group flex flex-col md:flex-row gap-3">
                        <button onClick={() => removeEducation(index)} className="absolute top-3 right-3 text-red-400 hover:text-red-600 dark:hover:text-red-300 opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 size={16} /></button>
                        <input className="apple-input bg-white dark:bg-dark-card w-full md:w-1/3 text-sm" placeholder="School/University" value={edu.school} onChange={e => updateEducation(index, 'school', e.target.value)} />
                        <input className="apple-input bg-white dark:bg-dark-card w-full md:w-1/3 text-sm" placeholder="Degree (e.g., BS Computer Science)" value={edu.degree} onChange={e => updateEducation(index, 'degree', e.target.value)} />
                        <input className="apple-input bg-white dark:bg-dark-card w-full md:w-1/3 text-sm md:mr-6" placeholder="Dates/Graduation" value={edu.dates} onChange={e => updateEducation(index, 'dates', e.target.value)} />
                      </div>
                    ))}
                  </div>
                </section>
              </div>

              <div className="p-5 border-t border-white/10 dark:border-white/5 bg-white dark:bg-dark-card flex items-center justify-between">
                <label className="flex items-center gap-3 cursor-pointer group">
                  <div className="relative flex items-center">
                    <input type="checkbox" className="sr-only" checked={resumeData.enhanceWithAI} onChange={(e) => setResumeData({...resumeData, enhanceWithAI: e.target.checked})} />
                    <div className={`w-11 h-6 rounded-full transition-colors ${resumeData.enhanceWithAI ? 'bg-purple-500' : 'bg-gray-300 dark:bg-dark-card'}`}></div>
                    <div className={`absolute w-4 h-4 bg-white rounded-full transition-transform transform ${resumeData.enhanceWithAI ? 'translate-x-6' : 'translate-x-1'} top-1`}></div>
                  </div>
                  <span className="text-sm font-medium text-gray-800 dark:text-gray-200 flex items-center gap-1.5">
                    <Sparkles size={16} className={resumeData.enhanceWithAI ? "text-purple-500" : "text-gray-400 dark:text-gray-500"} />
                    Enhance bullet points with AI
                  </span>
                </label>
                
                <div className="flex gap-3">
                  <button onClick={() => setShowWizard(false)} className="px-5 py-2.5 rounded-xl text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">Cancel</button>
                  <button onClick={handleGenerate} className="px-6 py-2.5 rounded-xl text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 transition-all shadow-md flex items-center gap-2">
                    Generate Resume
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Tailor to Job Modal */}
      <AnimatePresence>
        {showTailorWizard && (
          <div className="fixed inset-0 bg-black/40 dark:bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="bg-white dark:bg-dark-card rounded-2xl shadow-2xl w-full max-w-2xl max-h-[80vh] flex flex-col overflow-hidden border border-white/10 dark:border-white/5"
            >
              <div className="px-6 py-4 border-b border-gray-100 dark:border-white/5 flex justify-between items-center bg-gray-50/50 dark:bg-dark-card/50">
                <div>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white tracking-tight flex items-center gap-2">
                    <Target className="text-blue-500" size={20} />
                    Tailor to Job Description
                  </h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Paste the JD. We'll extract keywords and rewrite your resume to match.</p>
                </div>
                <button onClick={() => setShowTailorWizard(false)} className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full transition-colors text-gray-500 dark:text-gray-400">
                  <X size={20} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Version Title (Required)</label>
                    <input className="apple-input bg-gray-50 dark:bg-dark-surface w-full text-sm" placeholder="e.g. Frontend Dev - Meta" value={tailorVersionTitle} onChange={e => setTailorVersionTitle(e.target.value)} />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Target Company (Optional)</label>
                    <input className="apple-input bg-gray-50 dark:bg-dark-surface w-full text-sm" placeholder="e.g. Meta" value={targetCompany} onChange={e => setTargetCompany(e.target.value)} />
                  </div>
                </div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Job Description</label>
                <textarea 
                  className="apple-input bg-gray-50 dark:bg-dark-surface text-sm min-h-[200px] w-full resize-none" 
                  placeholder="Paste the target Job Description or company requirements here..." 
                  value={jobDescriptionText} 
                  onChange={e => setJobDescriptionText(e.target.value)} 
                />
              </div>

              <div className="p-5 border-t border-white/10 dark:border-white/5 bg-white dark:bg-dark-card flex items-center justify-end gap-3">
                <button onClick={() => setShowTailorWizard(false)} className="px-5 py-2.5 rounded-xl text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">Cancel</button>
                <button onClick={handleTailorJob} className="px-6 py-2.5 rounded-xl text-sm font-medium text-white bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-500 hover:from-blue-700 hover:to-indigo-700 transition-all shadow-md flex items-center gap-2">
                  <Target size={16} />
                  Tailor Resume
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      
      {/* Save As Modal */}
      <AnimatePresence>
        {showSaveAsModal && (
          <div className="fixed inset-0 bg-black/40 dark:bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="bg-white dark:bg-dark-card rounded-2xl shadow-2xl w-full max-w-md overflow-hidden border border-white/10 dark:border-white/5"
            >
              <div className="px-6 py-4 border-b border-gray-100 dark:border-white/5 flex justify-between items-center bg-gray-50/50 dark:bg-dark-card/50">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white tracking-tight flex items-center gap-2">
                  <Save className="text-blue-500" size={20} />
                  Save as New Version
                </h2>
                <button onClick={() => setShowSaveAsModal(false)} className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full transition-colors text-gray-500 dark:text-gray-400">
                  <X size={20} />
                </button>
              </div>
              <div className="p-6">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Version Title</label>
                <input 
                  className="apple-input bg-gray-50 dark:bg-dark-surface w-full text-sm" 
                  placeholder="e.g. Software Engineer - Google" 
                  value={saveAsTitle} 
                  onChange={e => setSaveAsTitle(e.target.value)} 
                  autoFocus
                />
              </div>
              <div className="p-5 border-t border-white/10 dark:border-white/5 bg-white dark:bg-dark-card flex items-center justify-end gap-3">
                <button onClick={() => setShowSaveAsModal(false)} className="px-5 py-2.5 rounded-xl text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">Cancel</button>
                <button onClick={saveAsNewVersion} disabled={!saveAsTitle.trim()} className="px-6 py-2.5 rounded-xl text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 transition-all shadow-md disabled:opacity-50">
                  Save Version
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Top Toolbar */}
      <header className="bg-white dark:bg-dark-card border-b border-white/10 dark:border-white/5 px-6 py-3 flex justify-between items-center z-10 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center">
            <FileText size={18} strokeWidth={2.5} />
          </div>
          <div>
            <h1 className="text-[17px] font-semibold text-gray-900 dark:text-white tracking-tight leading-none">LaTeX Editor</h1>
            <p className="text-[12px] text-gray-500 dark:text-gray-400 mt-0.5">Build ATS-friendly PDFs directly in your browser</p>
          </div>
        </div>

        <div className="flex items-center gap-2 mr-2 border-r border-white/10 dark:border-white/5 pr-4">
            <select 
              className="apple-input bg-gray-50 dark:bg-dark-surface text-[13px] py-1.5 px-3 rounded-lg min-w-[200px]"
              value={activeVersionId || ''}
              onChange={(e) => loadVersion(e.target.value)}
            >
              <option value="" disabled>Select Version</option>
              {versions.map(v => (
                <option key={v._id} value={v._id}>{v.title}</option>
              ))}
            </select>
            {activeVersionId && (
               <button onClick={(e) => deleteVersion(activeVersionId, e)} className="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors" title="Delete Version">
                 <Trash2 size={16} />
               </button>
            )}
          </div>
          <div className="flex items-center gap-2">
          {message && (
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0 }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium mr-2 ${
                messageType === 'success' 
                ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400' 
                : 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400'
              }`}
            >
              {messageType === 'success' ? <CheckCircle2 size={14} /> : <AlertCircle size={14} />}
              {message}
            </motion.div>
          )}

          <button 
            onClick={openWizard} 
            disabled={loading}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-full text-[13px] font-medium bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-400 hover:bg-purple-100 dark:hover:bg-purple-900/40 transition-colors disabled:opacity-50 border border-purple-100 dark:border-purple-800 shadow-sm"
          >
            {loading ? (
              <div className="w-3.5 h-3.5 border-2 border-purple-700 dark:border-purple-400 border-t-transparent rounded-full animate-spin" />
            ) : (
              <Sparkles size={14} />
            )}
            AI Resume Wizard
          </button>

          <button 
            onClick={() => setShowTailorWizard(true)} 
            disabled={tailoring || loading}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-full text-[13px] font-medium bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors disabled:opacity-50 border border-blue-100 dark:border-blue-800 shadow-sm ml-1"
          >
            {tailoring ? (
              <div className="w-3.5 h-3.5 border-2 border-blue-700 dark:border-blue-400 border-t-transparent rounded-full animate-spin" />
            ) : (
              <Target size={14} />
            )}
            Tailor to Job
          </button>
          
          <div className="w-px h-4 bg-gray-300 dark:bg-dark-card mx-1" />

          <button 
            onClick={saveLatex} 
            disabled={saving}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[13px] font-medium bg-gray-100 dark:bg-dark-card text-gray-900 dark:text-gray-100 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors disabled:opacity-50"
          >
            <Save size={14} />
            {saving ? 'Saving...' : 'Save'}
          </button>
          
          <button 
            onClick={() => setShowSaveAsModal(true)} 
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[13px] font-medium bg-gray-100 dark:bg-dark-card text-gray-900 dark:text-gray-100 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
          >
            <Plus size={14} />
            Save As
          </button>

          <button 
            onClick={downloadTex} 
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[13px] font-medium bg-gray-100 dark:bg-dark-card text-gray-900 dark:text-gray-100 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
          >
            <Download size={14} />
            .tex
          </button>

          <button 
            onClick={compilePdf} 
            disabled={compiling}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-full text-[13px] font-medium bg-blue-600 text-white hover:bg-blue-700 transition-colors shadow-sm ml-1 disabled:opacity-80"
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
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        {/* Left Pane: Editor */}
        <div className="w-full md:w-1/2 h-1/2 md:h-full border-b md:border-b-0 md:border-r border-white/10 dark:border-white/5 bg-[#1e1e1e] flex flex-col">
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
        <div className="w-full md:w-1/2 h-1/2 md:h-full bg-gray-200 dark:bg-dark-card flex flex-col relative">
          <div className="bg-gray-300 dark:bg-dark-surface text-gray-600 dark:text-gray-400 text-[11px] px-4 py-1.5 font-sans border-b border-white/10 dark:border-white/5 shadow-sm z-10">
            Preview.pdf
          </div>
          
          <div className="flex-1 overflow-hidden flex items-center justify-center relative">
            <iframe 
              name="pdf-preview-iframe"
              className={`w-full h-full border-none bg-white ${!latexCode || (!pdfUrl && !compiling) ? 'hidden' : ''}`}
              title="PDF Preview"
            />
            
            {(!latexCode || (!pdfUrl && !compiling)) && (
              <div className="text-gray-500 dark:text-gray-400 flex flex-col items-center max-w-xs text-center absolute">
                <div className="w-16 h-16 mb-4 rounded-2xl bg-white dark:bg-dark-card flex items-center justify-center border border-white/10 dark:border-gray-600 shadow-sm">
                  <Play size={24} className="text-gray-400 dark:text-gray-500 ml-1" />
                </div>
                <h3 className="text-gray-700 dark:text-gray-200 font-medium text-lg mb-1">No Preview Available</h3>
                <p className="text-[13px] leading-relaxed">
                  Write your LaTeX code on the left and click Compile to generate your PDF preview.
                </p>
              </div>
            )}
            
            {/* Compiling Overlay Overlay */}
            {compiling && (
              <div className="absolute inset-0 bg-white/80 dark:bg-dark-card/80 backdrop-blur-sm flex flex-col items-center justify-center z-20">
                 <div className="w-10 h-10 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mb-4" />
                 <p className="text-gray-900 dark:text-white font-medium text-sm">Compiling document...</p>
                 <p className="text-gray-500 dark:text-gray-400 text-xs mt-1">Connecting to compiler engine</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResumeLatex;