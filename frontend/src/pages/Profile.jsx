import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import AuthContext from '../context/AuthContext';
import { Save, AlertCircle, Plus, Trash2 } from 'lucide-react';
import { Button } from '../components/ui/Button';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const Profile = () => {
  useEffect(() => { document.title = 'My Profile | CareerLens'; }, []);
  const { user } = useContext(AuthContext);
  const [profile, setProfile] = useState({
    basics: { name: '', email: '', phone: '', location: '', summary: '', linkedin: '', github: '', portfolio: '' },
    skills: [],
    experience: [],
    education: [],
    projects: []
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(null); // { type, index }

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) return;
      try {
        const res = await axios.get(`${API_URL}/profile`, {
          headers: { Authorization: `Bearer ${user.token}` }
        });
        setProfile(res.data);
      } catch (err) {
        console.error(err);
        setError('Failed to load profile.');
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [user]);

  const handleSave = async () => {
    try {
      setSaving(true);
      setError(null);
      setSuccess(false);
      const res = await axios.put(`${API_URL}/profile`, profile, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      setProfile(res.data);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      console.error(err);
      setError('Failed to save profile.');
    } finally {
      setSaving(false);
    }
  };

  const handleBasicChange = (field, value) => {
    setProfile(prev => ({
      ...prev,
      basics: { ...prev.basics, [field]: value }
    }));
  };

  const handleSkillsChange = (e) => {
    const val = e.target.value;
    setProfile(prev => ({
      ...prev,
      skills: val.split(',').map(s => s.trim())
    }));
  };

  const addArrayItem = (type) => {
    let newItem = {};
    if (type === 'experience') newItem = { company: '', role: '', duration: '', description: '' };
    if (type === 'education') newItem = { institution: '', degree: '', duration: '' };
    if (type === 'projects') newItem = { name: '', description: '', techStack: [] };

    setProfile(prev => ({
      ...prev,
      [type]: [...prev[type], newItem]
    }));
  };

  const updateArrayItem = (type, index, field, value) => {
    setProfile(prev => {
      const arr = [...prev[type]];
      if (field === 'techStack') {
        arr[index][field] = value.split(',').map(s => s.trim());
      } else {
        arr[index][field] = value;
      }
      return { ...prev, [type]: arr };
    });
  };

  const removeArrayItem = (type, index) => {
    setProfile(prev => {
      const arr = [...prev[type]];
      arr.splice(index, 1);
      return { ...prev, [type]: arr };
    });
  };

  if (!user) {
    return (
      <div className="min-h-[calc(100vh-64px)] flex items-center justify-center p-6">
        <div className="bg-bg-card rounded-2xl border border-border-color p-8 text-center max-w-[400px] w-full">
          <AlertCircle className="w-10 h-10 text-red-500 mx-auto mb-5" />
          <h2 className="text-2xl font-bold text-text-main mb-2">Sign in required</h2>
        </div>
      </div>
    );
  }

  if (loading) {
    return <div className="min-h-[calc(100vh-64px)] flex items-center justify-center"><div className="space-y-3 w-64"><div className="h-4 animate-pulse bg-slate-200 dark:bg-slate-700 rounded w-3/4 mx-auto" /><div className="h-4 animate-pulse bg-slate-200 dark:bg-slate-700 rounded w-1/2 mx-auto" /><div className="h-4 animate-pulse bg-slate-200 dark:bg-slate-700 rounded w-2/3 mx-auto" /></div></div>;
  }

  const inputClass = "w-full rounded-xl border border-border-color bg-bg-card px-4 py-3 text-[15px] text-text-main placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-accent-500 focus:border-transparent transition-colors";

  return (
    <div className="min-h-[calc(100vh-64px)] px-4 py-12 md:py-16 relative z-10">
      <div className="max-w-[800px] mx-auto w-full">
        <div
           className="mb-8 flex items-center justify-between"
        >
          <div>
            <h1 className="text-4xl md:text-[40px] font-bold text-text-main tracking-tighter mb-2">My Profile</h1>
            <p className="text-[17px] text-text-muted">Manage your professional identity. Extracted from your resume AI analysis.</p>
          </div>
          <button 
            onClick={handleSave} 
            disabled={saving}
            className="bg-accent-700 hover:bg-accent-800 text-white rounded-lg font-bold flex items-center gap-2 px-6 py-2.5 text-sm disabled:opacity-50 transition-colors shadow-sm"
          >
            {saving ? <span className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" /> : <Save size={18} />}
            {saving ? 'Saving...' : 'Save Profile'}
          </button>
        </div>

        {error && <div role="alert" className="p-4 mb-6 text-red-500 bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-200 dark:border-red-800">{error}</div>}
        {success && <div role="status" className="p-4 mb-6 text-green-500 dark:text-green-400 bg-green-50 dark:bg-green-900/20 rounded-xl border border-green-200 dark:border-green-800">Profile saved successfully!</div>}

        {/* Basics Section */}
        <div className="bg-bg-card rounded-2xl border border-border-color p-6 mb-6">
          <h3 className="text-xl font-bold text-text-main mb-4">Basic Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input placeholder="Name" value={profile.basics?.name || ''} onChange={e => handleBasicChange('name', e.target.value)} className={inputClass} />
            <input placeholder="Email" value={profile.basics?.email || ''} onChange={e => handleBasicChange('email', e.target.value)} className={inputClass} />
            <input placeholder="Phone" value={profile.basics?.phone || ''} onChange={e => handleBasicChange('phone', e.target.value)} className={inputClass} />
            <input placeholder="Location" value={profile.basics?.location || ''} onChange={e => handleBasicChange('location', e.target.value)} className={inputClass} />
            <input placeholder="LinkedIn URL" value={profile.basics?.linkedin || ''} onChange={e => handleBasicChange('linkedin', e.target.value)} className={inputClass} />
            <input placeholder="GitHub URL" value={profile.basics?.github || ''} onChange={e => handleBasicChange('github', e.target.value)} className={inputClass} />
          </div>
          <textarea placeholder="Professional Summary" value={profile.basics?.summary || ''} onChange={e => handleBasicChange('summary', e.target.value)} className={`${inputClass} mt-4 min-h-[100px]`} />
        </div>

        {/* Skills Section */}
        <div className="bg-bg-card rounded-2xl border border-border-color p-6 mb-6">
          <h3 className="text-xl font-bold text-text-main mb-4">Skills</h3>
          <p className="text-sm text-text-muted mb-2">Comma separated skills</p>
          <input placeholder="React, Node.js, Python..." value={(profile.skills || []).join(', ')} onChange={handleSkillsChange} className={inputClass} />
        </div>

        {/* Experience Section */}
        <div className="bg-bg-card rounded-2xl border border-border-color p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold text-text-main">Experience</h3>
            <button onClick={() => addArrayItem('experience')} className="text-accent-700 dark:text-accent-400 hover:text-accent-600 flex items-center gap-1 text-sm font-medium">
              <Plus size={16} /> Add Experience
            </button>
          </div>
          {(profile.experience || []).map((exp, idx) => (
            <div key={idx} className="bg-bg-main rounded-xl border border-border-color p-4 mb-4 relative">
              <button onClick={() => setConfirmDelete({ type: 'experience', index: idx })} className="absolute top-4 right-4 text-gray-400 hover:text-red-500 transition" aria-label="Remove experience"><Trash2 size={16} /></button>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3 pr-8">
                <input placeholder="Company" value={exp.company} onChange={e => updateArrayItem('experience', idx, 'company', e.target.value)} className={inputClass} />
                <input placeholder="Role" value={exp.role} onChange={e => updateArrayItem('experience', idx, 'role', e.target.value)} className={inputClass} />
                <input placeholder="Duration (e.g. 2020 - 2022)" value={exp.duration} onChange={e => updateArrayItem('experience', idx, 'duration', e.target.value)} className={inputClass} />
              </div>
              <textarea placeholder="Description" value={exp.description} onChange={e => updateArrayItem('experience', idx, 'description', e.target.value)} className={`${inputClass} min-h-[80px]`} />
            </div>
          ))}
          {(!profile.experience || profile.experience.length === 0) && <p className="text-text-muted text-sm">No experience added. Click "Add Experience" to start.</p>}
        </div>

        {/* Projects Section */}
        <div className="bg-bg-card rounded-2xl border border-border-color p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold text-text-main">Projects</h3>
            <button onClick={() => addArrayItem('projects')} className="text-accent-700 dark:text-accent-400 hover:text-accent-600 flex items-center gap-1 text-sm font-medium">
              <Plus size={16} /> Add Project
            </button>
          </div>
          {(profile.projects || []).map((proj, idx) => (
            <div key={idx} className="bg-bg-main rounded-xl border border-border-color p-4 mb-4 relative">
              <button onClick={() => setConfirmDelete({ type: 'projects', index: idx })} className="absolute top-4 right-4 text-gray-400 hover:text-red-500 transition" aria-label="Remove project"><Trash2 size={16} /></button>
              <div className="grid grid-cols-1 gap-3 mb-3 pr-8">
                <input placeholder="Project Name" value={proj.name} onChange={e => updateArrayItem('projects', idx, 'name', e.target.value)} className={inputClass} />
                <input placeholder="Tech Stack (comma separated)" value={(proj.techStack || []).join(', ')} onChange={e => updateArrayItem('projects', idx, 'techStack', e.target.value)} className={inputClass} />
              </div>
              <textarea placeholder="Description" value={proj.description} onChange={e => updateArrayItem('projects', idx, 'description', e.target.value)} className={`${inputClass} min-h-[80px]`} />
            </div>
          ))}
          {(!profile.projects || profile.projects.length === 0) && <p className="text-text-muted text-sm">No projects added. Click "Add Project" to start.</p>}
        </div>

        {/* Education Section */}
        <div className="bg-bg-card rounded-2xl border border-border-color p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold text-text-main">Education</h3>
            <button onClick={() => addArrayItem('education')} className="text-accent-700 dark:text-accent-400 hover:text-accent-600 flex items-center gap-1 text-sm font-medium">
              <Plus size={16} /> Add Education
            </button>
          </div>
          {(profile.education || []).map((edu, idx) => (
            <div key={idx} className="bg-bg-main rounded-xl border border-border-color p-4 mb-4 relative">
               <button onClick={() => setConfirmDelete({ type: 'education', index: idx })} className="absolute top-4 right-4 text-gray-400 hover:text-red-500 transition" aria-label="Remove education"><Trash2 size={16} /></button>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pr-8">
                <input placeholder="Institution" value={edu.institution} onChange={e => updateArrayItem('education', idx, 'institution', e.target.value)} className={inputClass} />
                <input placeholder="Degree" value={edu.degree} onChange={e => updateArrayItem('education', idx, 'degree', e.target.value)} className={inputClass} />
                <input placeholder="Duration/Year" value={edu.duration} onChange={e => updateArrayItem('education', idx, 'duration', e.target.value)} className={inputClass} />
              </div>
            </div>
          ))}
          {(!profile.education || profile.education.length === 0) && <p className="text-text-muted text-sm">No education added. Click "Add Education" to start.</p>}
        </div>

        <div className="flex justify-end mb-12">
            <button 
              onClick={handleSave} 
              disabled={saving}
              className="bg-accent-700 hover:bg-accent-800 text-white rounded-lg font-bold flex items-center gap-2 px-8 py-3.5 text-[15px] disabled:opacity-50 transition-colors shadow-sm"
            >
              {saving ? <span className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" /> : <Save size={18} />}
              {saving ? 'Saving...' : 'Save Profile'}
            </button>
        </div>

      </div>

      {/* Confirmation modal for delete */}
      <>
        {confirmDelete && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
            onClick={() => setConfirmDelete(null)}
          >
            <div
              className="bg-bg-card rounded-2xl border border-border-color shadow-xl p-6 max-w-sm w-full"
              onClick={e => e.stopPropagation()}
            >
              <h3 className="text-lg font-bold text-text-main mb-2">Delete this item?</h3>
              <p className="text-sm text-text-muted mb-6">This action cannot be undone. Are you sure you want to remove this {confirmDelete.type.slice(0, -1)} entry?</p>
              <div className="flex gap-3 justify-end">
                <Button variant="outline" onClick={() => setConfirmDelete(null)}>Cancel</Button>
                <Button variant="destructive" onClick={() => { removeArrayItem(confirmDelete.type, confirmDelete.index); setConfirmDelete(null); }}>Delete</Button>
              </div>
            </div>
          </div>
        )}
      </>
    </div>
  );
};

export default Profile;
