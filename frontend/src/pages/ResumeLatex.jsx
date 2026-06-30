import React, { useState, useEffect, useRef, useCallback } from 'react';
import axios from 'axios';
import Editor from '@monaco-editor/react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Play, Download, Save, Sparkles, FileText, CheckCircle2, AlertCircle,
  X, Plus, Trash2, Target, Code2, Eye, Wand2, RotateCcw, RefreshCw,
  ChevronRight, ChevronLeft, Clock, Upload, Pencil, Cpu, Check,
} from 'lucide-react';
import AuthContext from '../context/AuthContext';
import { useContext } from 'react';
import { useLocation } from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// ── Source badge config ────────────────────────────────────────────────────────
const SOURCE_CONFIG = {
  upload:           { label: 'Uploaded',     color: 'bg-gray-500',    icon: Upload },
  'ai-wizard':      { label: 'AI Wizard',    color: 'bg-purple-500',  icon: Sparkles },
  'ai-optimized':   { label: 'AI Optimized', color: 'bg-emerald-500', icon: Wand2 },
  'ai-tailored':    { label: 'AI Tailored',  color: 'bg-blue-500',    icon: Target },
  'ai-section-edit':{ label: 'AI Edited',    color: 'bg-amber-500',   icon: Cpu },
  'manual-edit':    { label: 'Manual',       color: 'bg-slate-400',   icon: Pencil },
};

const SourceBadge = ({ source }) => {
  const cfg = SOURCE_CONFIG[source] || SOURCE_CONFIG['manual-edit'];
  const Icon = cfg.icon;
  return (
    <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[9px] font-semibold text-white ${cfg.color}`}>
      <Icon className="w-2.5 h-2.5" />
      {cfg.label}
    </span>
  );
};

// ── Section Rewrite Panel ──────────────────────────────────────────────────────
const SectionRewritePanel = ({ section, rewrite, loading, onAccept, onReject, onRegenerate, onClose }) => {
  const [editMode, setEditMode] = useState(false);
  const [editedContent, setEditedContent] = useState(rewrite?.rewritten || '');

  useEffect(() => {
    if (rewrite?.rewritten) setEditedContent(rewrite.rewritten);
  }, [rewrite]);

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className="absolute inset-0 z-30 bg-white dark:bg-slate-900 flex flex-col"
    >
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between bg-gray-50 dark:bg-slate-800">
        <div className="flex items-center gap-2">
          <Wand2 className="w-4 h-4 text-purple-500" />
          <h3 className="text-sm font-bold text-gray-900 dark:text-white">AI Rewrite: {section?.name || 'Section'}</h3>
        </div>
        <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-500">
          <X className="w-4 h-4" />
        </button>
      </div>

      {loading ? (
        <div className="flex-1 flex flex-col items-center justify-center gap-3">
          <div className="w-10 h-10 border-3 border-purple-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-gray-500 dark:text-gray-400">Rewriting section with AI…</p>
        </div>
      ) : rewrite ? (
        <>
          {/* Diff view */}
          <div className="flex-1 overflow-y-auto">
            <div className="grid grid-cols-2 divide-x divide-gray-100 dark:divide-gray-700 h-full">
              {/* Original */}
              <div className="p-4 overflow-auto">
                <p className="text-[10px] font-bold text-red-500 uppercase tracking-wider mb-2 flex items-center gap-1">
                  <X className="w-3 h-3" /> Current
                </p>
                <pre className="text-xs text-gray-700 dark:text-gray-300 whitespace-pre-wrap font-mono leading-relaxed">
                  {section?.content}
                </pre>
              </div>
              {/* Rewritten */}
              <div className="p-4 overflow-auto bg-emerald-50/20 dark:bg-emerald-900/5">
                <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider mb-2 flex items-center gap-1">
                  <Sparkles className="w-3 h-3" /> AI Suggestion
                </p>
                {editMode ? (
                  <textarea
                    value={editedContent}
                    onChange={e => setEditedContent(e.target.value)}
                    className="w-full h-[calc(100%-24px)] text-xs font-mono leading-relaxed bg-white dark:bg-slate-800 border border-gray-200 dark:border-gray-700 rounded-lg p-3 resize-none outline-none focus:ring-2 focus:ring-purple-500/30"
                  />
                ) : (
                  <pre className="text-xs text-gray-700 dark:text-gray-300 whitespace-pre-wrap font-mono leading-relaxed">
                    {rewrite.rewritten}
                  </pre>
                )}
              </div>
            </div>

            {/* Changes list */}
            {rewrite.changes?.length > 0 && (
              <div className="px-4 py-3 border-t border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-slate-800/50">
                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2">Changes Made</p>
                <ul className="space-y-1">
                  {rewrite.changes.map((change, i) => (
                    <li key={i} className="text-[11px] text-gray-600 dark:text-gray-400 flex items-start gap-1.5">
                      <CheckCircle2 className="w-3 h-3 text-emerald-500 shrink-0 mt-0.5" />
                      {change}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="px-4 py-3 border-t border-gray-100 dark:border-gray-700 flex items-center justify-between bg-white dark:bg-slate-900">
            <button
              onClick={() => setEditMode(!editMode)}
              className="text-xs text-gray-600 dark:text-gray-400 flex items-center gap-1.5 hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              <Pencil className="w-3 h-3" /> {editMode ? 'Preview' : 'Edit manually'}
            </button>
            <div className="flex items-center gap-2">
              <button
                onClick={onReject}
                className="px-3 py-1.5 rounded-lg text-xs font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                Reject
              </button>
              <button
                onClick={onRegenerate}
                className="px-3 py-1.5 rounded-lg text-xs font-medium text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/20 hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-colors flex items-center gap-1"
              >
                <RefreshCw className="w-3 h-3" /> Regenerate
              </button>
              <button
                onClick={() => onAccept(editMode ? editedContent : rewrite.rewritten)}
                className="px-4 py-1.5 rounded-lg text-xs font-bold text-white bg-emerald-500 hover:bg-emerald-600 transition-colors flex items-center gap-1"
              >
                <Check className="w-3 h-3" /> Accept
              </button>
            </div>
          </div>
        </>
      ) : (
        <div className="flex-1 flex items-center justify-center text-sm text-gray-500">
          Click a section to rewrite it with AI
        </div>
      )}
    </motion.div>
  );
};


const ResumeLatex = () => {
  const { user } = useContext(AuthContext);
  const location = useLocation();

  const [latexCode, setLatexCode] = useState('');
  const [pdfUrl, setPdfUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [compiling, setCompiling] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');

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
  const [showVersionSidebar, setShowVersionSidebar] = useState(true);

  // Tailor Extra Fields
  const [tailorVersionTitle, setTailorVersionTitle] = useState('');
  const [targetCompany, setTargetCompany] = useState('');

  // View toggle (Phase 3)
  const [rightPaneView, setRightPaneView] = useState('preview'); // 'preview' | 'source'

  // AI Section Rewrite (Phase 3)
  const [selectedSection, setSelectedSection] = useState(null);
  const [sectionRewrite, setSectionRewrite] = useState(null);
  const [rewriteLoading, setRewriteLoading] = useState(false);
  const [showRewritePanel, setShowRewritePanel] = useState(false);

  const editorRef = useRef(null);

  const handleEditorDidMount = (editor) => {
    editorRef.current = editor;
  };

  const fetchVersions = async () => {
    if (!user) return;
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const { data } = await axios.get(`${API_URL}/resume/versions`, config);

      if (data && data.length > 0) {
        setVersions(data);
        // Check if we should load a specific version from navigation state
        const navVersionId = location.state?.versionId;
        if (navVersionId) {
          await loadVersion(navVersionId, config);
        } else {
          await loadVersion(data[0]._id, config);
        }
      } else {
        // Fallback to legacy GET /latex
        const legacy = await axios.get(`${API_URL}/resume/latex`, config);
        if (legacy.data.rawLatexCode) {
          const res = await axios.post(`${API_URL}/resume/versions`, {
            title: 'Base Resume',
            rawLatexCode: legacy.data.rawLatexCode,
            isBaseResume: true,
            source: 'upload'
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
      const { data } = await axios.get(`${API_URL}/resume/versions/${id}`, config);
      setLatexCode(data.rawLatexCode);
      setActiveVersionId(id);
      setPdfUrl('');
    } catch (error) {
      showToast('Failed to load version', 'error');
    }
  };

  useEffect(() => {
    fetchVersions();
  }, [user]);

  // Auto-load version from navigation state
  useEffect(() => {
    if (location.state?.versionId && versions.length > 0) {
      const exists = versions.find(v => v._id === location.state.versionId);
      if (exists && activeVersionId !== location.state.versionId) {
        loadVersion(location.state.versionId);
      }
    }
  }, [location.state, versions]);

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
        await axios.put(`${API_URL}/resume/versions/${activeVersionId}`, { rawLatexCode: latexCode }, config);
        const updatedVersions = versions.map(v => v._id === activeVersionId ? { ...v, rawLatexCode: latexCode } : v);
        setVersions(updatedVersions);
        showToast('Version saved successfully');
      } else {
        const { data } = await axios.post(`${API_URL}/resume/versions`, { title: 'Untitled Version', rawLatexCode: latexCode }, config);
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
      const { data } = await axios.post(`${API_URL}/resume/versions`, {
        title: saveAsTitle,
        rawLatexCode: latexCode,
        source: 'manual-edit'
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
    if (e) e.stopPropagation();
    if (!window.confirm("Are you sure you want to delete this version?")) return;
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      await axios.delete(`${API_URL}/resume/versions/${id}`, config);
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

  const restoreVersion = async (id) => {
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const { data: original } = await axios.get(`${API_URL}/resume/versions/${id}`, config);
      const { data: newVersion } = await axios.post(`${API_URL}/resume/versions`, {
        title: `Restored: ${original.title}`,
        rawLatexCode: original.rawLatexCode,
        source: original.source || 'manual-edit'
      }, config);
      setVersions([newVersion, ...versions]);
      setLatexCode(newVersion.rawLatexCode);
      setActiveVersionId(newVersion._id);
      showToast('Version restored as a new copy');
    } catch (error) {
      showToast('Failed to restore version', 'error');
    }
  };

  const openWizard = async () => {
    if (!user) return;
    setShowWizard(true);
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const { data } = await axios.get(`${API_URL}/resume/`, config);
      if (data) {
        setResumeData(prev => ({
          ...prev,
          skills: data.extractedSkills ? data.extractedSkills.join(', ') : prev.skills,
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
    setShowWizard(false);
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const { data } = await axios.post(`${API_URL}/resume/latex/generate`, { resumeData }, config);
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
      const { data } = await axios.post(`${API_URL}/resume/latex/tailor`, { jobDescription: jobDescriptionText }, config);
      setLatexCode(data.rawLatexCode);

      const res = await axios.post(`${API_URL}/resume/versions`, {
        title: tailorVersionTitle,
        targetCompany: targetCompany,
        targetJobDescription: jobDescriptionText,
        rawLatexCode: data.rawLatexCode,
        source: 'ai-tailored'
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
    try {
      const form = document.createElement('form');
      form.method = 'POST';
      form.action = 'https://texlive.net/cgi-bin/latexcgi';
      form.target = 'pdf-preview-iframe';
      form.enctype = 'multipart/form-data';

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
      form.submit();
      document.body.removeChild(form);
      setPdfUrl('compiled');
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

  // ── Section Detection + AI Rewrite ─────────────────────────────────────────
  const parseSections = useCallback((code) => {
    const sections = [];
    const regex = /\\section\{([^}]+)\}/gi;
    const lines = code.split('\n');
    let match;

    while ((match = regex.exec(code)) !== null) {
      const sectionName = match[1];
      const startPos = match.index;
      const startLine = code.substring(0, startPos).split('\n').length;
      sections.push({ name: sectionName, startLine, startPos });
    }

    // Calculate end lines
    for (let i = 0; i < sections.length; i++) {
      const nextStart = i < sections.length - 1 ? sections[i + 1].startLine - 1 : lines.length;
      sections[i].endLine = nextStart;
      sections[i].content = lines.slice(sections[i].startLine - 1, nextStart).join('\n');
    }

    return sections;
  }, []);

  const handleSectionRewrite = async (section) => {
    setSelectedSection(section);
    setShowRewritePanel(true);
    setRewriteLoading(true);
    setSectionRewrite(null);
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const { data } = await axios.post(`${API_URL}/resume/rewrite-section`, {
        sectionType: section.name.toLowerCase(),
        sectionContent: section.content,
      }, config);
      setSectionRewrite(data);
    } catch (error) {
      showToast('Failed to rewrite section', 'error');
      setShowRewritePanel(false);
    } finally {
      setRewriteLoading(false);
    }
  };

  const handleAcceptRewrite = (newContent) => {
    if (!selectedSection) return;
    const lines = latexCode.split('\n');
    const before = lines.slice(0, selectedSection.startLine - 1);
    const after = lines.slice(selectedSection.endLine);
    const newCode = [...before, ...newContent.split('\n'), ...after].join('\n');
    setLatexCode(newCode);
    setShowRewritePanel(false);
    setSectionRewrite(null);
    setSelectedSection(null);
    showToast('Section rewritten successfully!');
  };

  const handleRejectRewrite = () => {
    setShowRewritePanel(false);
    setSectionRewrite(null);
    setSelectedSection(null);
  };

  const handleRegenerateRewrite = () => {
    if (selectedSection) handleSectionRewrite(selectedSection);
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

  // Get detected sections for the toolbar
  const detectedSections = latexCode ? parseSections(latexCode) : [];

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <div className="h-[calc(100vh-54px)] flex flex-col bg-gray-50 dark:bg-dark-surface overflow-hidden relative">

      {/* Wizard Modal */}
      <AnimatePresence>
        {showWizard && (
          <div key="wizard-modal" className="fixed inset-0 bg-black/40 dark:bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
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
          <div key="tailor-modal" className="fixed inset-0 bg-black/40 dark:bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
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
          <div key="save-modal" className="fixed inset-0 bg-black/40 dark:bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
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
      <header className="bg-white dark:bg-dark-card border-b border-white/10 dark:border-white/5 px-4 py-2.5 flex justify-between items-center z-10 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center">
            <FileText size={18} strokeWidth={2.5} />
          </div>
          <div>
            <h1 className="text-[17px] font-semibold text-gray-900 dark:text-white tracking-tight leading-none">LaTeX Editor</h1>
            <p className="text-[12px] text-gray-500 dark:text-gray-400 mt-0.5">Build ATS-friendly PDFs directly in your browser</p>
          </div>
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
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12px] font-medium bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-400 hover:bg-purple-100 dark:hover:bg-purple-900/40 transition-colors disabled:opacity-50 border border-purple-100 dark:border-purple-800 shadow-sm"
          >
            {loading ? (
              <div className="w-3.5 h-3.5 border-2 border-purple-700 dark:border-purple-400 border-t-transparent rounded-full animate-spin" />
            ) : (
              <Sparkles size={13} />
            )}
            AI Wizard
          </button>

          <button
            onClick={() => setShowTailorWizard(true)}
            disabled={tailoring || loading}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12px] font-medium bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors disabled:opacity-50 border border-blue-100 dark:border-blue-800 shadow-sm"
          >
            {tailoring ? (
              <div className="w-3.5 h-3.5 border-2 border-blue-700 dark:border-blue-400 border-t-transparent rounded-full animate-spin" />
            ) : (
              <Target size={13} />
            )}
            Tailor
          </button>

          <div className="w-px h-4 bg-gray-300 dark:bg-dark-card mx-0.5" />

          <button onClick={saveLatex} disabled={saving} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12px] font-medium bg-gray-100 dark:bg-dark-card text-gray-900 dark:text-gray-100 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors disabled:opacity-50">
            <Save size={13} /> {saving ? 'Saving...' : 'Save'}
          </button>

          <button onClick={() => setShowSaveAsModal(true)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12px] font-medium bg-gray-100 dark:bg-dark-card text-gray-900 dark:text-gray-100 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
            <Plus size={13} /> Save As
          </button>

          <button onClick={downloadTex} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12px] font-medium bg-gray-100 dark:bg-dark-card text-gray-900 dark:text-gray-100 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
            <Download size={13} /> .tex
          </button>

          <button onClick={compilePdf} disabled={compiling} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12px] font-medium bg-blue-600 text-white hover:bg-blue-700 transition-colors shadow-sm disabled:opacity-80">
            {compiling ? (
              <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <Play size={13} fill="currentColor" className="ml-0.5" />
            )}
            Compile
          </button>

          {/* Version sidebar toggle */}
          <button
            onClick={() => setShowVersionSidebar(!showVersionSidebar)}
            className="flex items-center gap-1 px-2 py-1.5 rounded-full text-[12px] font-medium bg-gray-100 dark:bg-dark-card text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors ml-0.5"
            title={showVersionSidebar ? 'Hide versions' : 'Show versions'}
          >
            <Clock size={13} />
            {showVersionSidebar ? <ChevronRight size={13} /> : <ChevronLeft size={13} />}
          </button>
        </div>
      </header>

      {/* Main Workspace */}
      <div className="flex-1 flex overflow-hidden">

        {/* Left Pane: Editor */}
        <div className="flex-1 h-full flex flex-col border-r border-white/10 dark:border-white/5 bg-[#1e1e1e] min-w-0">
          {/* Section toolbar */}
          {detectedSections.length > 0 && (
            <div className="bg-[#252526] px-3 py-1.5 flex items-center gap-1.5 border-b border-[#1e1e1e] overflow-x-auto">
              <Wand2 className="w-3 h-3 text-purple-400 shrink-0" />
              <span className="text-[10px] text-gray-500 shrink-0 mr-1">AI Rewrite:</span>
              {detectedSections.map((section, i) => (
                <button
                  key={i}
                  onClick={() => handleSectionRewrite(section)}
                  className="px-2 py-0.5 rounded text-[10px] font-medium text-gray-400 hover:text-white hover:bg-purple-500/20 transition-colors shrink-0"
                >
                  {section.name}
                </button>
              ))}
            </div>
          )}
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
              onMount={handleEditorDidMount}
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

        {/* Right Pane: Preview / Source */}
        <div className={`h-full bg-gray-200 dark:bg-dark-card flex flex-col relative ${showVersionSidebar ? 'w-[40%]' : 'w-1/2'}`}>
          {/* Tab switcher */}
          <div className="bg-gray-300 dark:bg-dark-surface text-[11px] px-2 py-1 font-sans border-b border-white/10 dark:border-white/5 shadow-sm z-10 flex items-center justify-between">
            <div className="flex items-center gap-0.5">
              <button
                onClick={() => setRightPaneView('preview')}
                className={`flex items-center gap-1 px-2.5 py-1 rounded text-[11px] font-medium transition-colors ${
                  rightPaneView === 'preview'
                    ? 'bg-white dark:bg-slate-700 text-gray-900 dark:text-white shadow-sm'
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
              >
                <Eye className="w-3 h-3" /> PDF Preview
              </button>
              <button
                onClick={() => setRightPaneView('source')}
                className={`flex items-center gap-1 px-2.5 py-1 rounded text-[11px] font-medium transition-colors ${
                  rightPaneView === 'source'
                    ? 'bg-white dark:bg-slate-700 text-gray-900 dark:text-white shadow-sm'
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
              >
                <Code2 className="w-3 h-3" /> LaTeX Source
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-hidden flex items-center justify-center relative">
            {rightPaneView === 'preview' ? (
              <>
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
                {compiling && (
                  <div className="absolute inset-0 bg-white/80 dark:bg-dark-card/80 backdrop-blur-sm flex flex-col items-center justify-center z-20">
                    <div className="w-10 h-10 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mb-4" />
                    <p className="text-gray-900 dark:text-white font-medium text-sm">Compiling document...</p>
                    <p className="text-gray-500 dark:text-gray-400 text-xs mt-1">Connecting to compiler engine</p>
                  </div>
                )}
              </>
            ) : (
              <div className="w-full h-full">
                <Editor
                  height="100%"
                  defaultLanguage="latex"
                  theme="vs-dark"
                  value={latexCode}
                  options={{
                    readOnly: true,
                    wordWrap: 'on',
                    minimap: { enabled: false },
                    fontSize: 12,
                    fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
                    lineHeight: 22,
                    scrollBeyondLastLine: false,
                  }}
                />
              </div>
            )}
          </div>

          {/* Section Rewrite Panel overlay */}
          <AnimatePresence>
            {showRewritePanel && (
              <SectionRewritePanel
                section={selectedSection}
                rewrite={sectionRewrite}
                loading={rewriteLoading}
                onAccept={handleAcceptRewrite}
                onReject={handleRejectRewrite}
                onRegenerate={handleRegenerateRewrite}
                onClose={handleRejectRewrite}
              />
            )}
          </AnimatePresence>
        </div>

        {/* Version History Sidebar (Phase 4) */}
        <AnimatePresence>
          {showVersionSidebar && (
            <motion.div
              key="version-sidebar"
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 260, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              className="h-full bg-white dark:bg-slate-900 border-l border-gray-200 dark:border-gray-700 flex flex-col overflow-hidden shrink-0"
            >
              <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
                <h3 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-gray-500" />
                  Versions
                </h3>
                <span className="text-[10px] font-medium text-gray-400 bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded">
                  {versions.length}
                </span>
              </div>
              <div className="flex-1 overflow-y-auto">
                {versions.map((v) => (
                  <button
                    key={v._id}
                    onClick={() => loadVersion(v._id)}
                    className={`w-full text-left px-4 py-3 border-b border-gray-50 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors group ${
                      activeVersionId === v._id ? 'bg-blue-50/50 dark:bg-blue-900/10 border-l-2 border-l-blue-500' : 'border-l-2 border-l-transparent'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <p className={`text-[13px] font-semibold truncate ${
                        activeVersionId === v._id
                          ? 'text-blue-700 dark:text-blue-400'
                          : 'text-gray-900 dark:text-white'
                      }`}>
                        {v.title}
                      </p>
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                        <button
                          onClick={(e) => { e.stopPropagation(); restoreVersion(v._id); }}
                          className="p-1 rounded text-gray-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                          title="Restore as new copy"
                        >
                          <RotateCcw className="w-3 h-3" />
                        </button>
                        <button
                          onClick={(e) => deleteVersion(v._id, e)}
                          className="p-1 rounded text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                          title="Delete version"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <SourceBadge source={v.source || (v.isBaseResume ? 'upload' : 'manual-edit')} />
                      <span className="text-[10px] text-gray-400">
                        {formatDate(v.updatedAt || v.createdAt)}
                      </span>
                    </div>
                    {v.targetCompany && (
                      <p className="text-[10px] text-gray-500 mt-1 flex items-center gap-1">
                        <Target className="w-2.5 h-2.5" /> {v.targetCompany}
                      </p>
                    )}
                  </button>
                ))}
                {versions.length === 0 && (
                  <div className="px-4 py-8 text-center">
                    <p className="text-sm text-gray-400 dark:text-gray-500">No versions yet</p>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default ResumeLatex;
