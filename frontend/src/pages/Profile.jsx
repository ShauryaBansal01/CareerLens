import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import AuthContext from '../context/AuthContext';
import { motion } from 'framer-motion';
import { Save, AlertCircle, Plus, Trash2 } from 'lucide-react';

const Profile = () => {
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

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) return;
      try {
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/profile`, {
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
      const res = await axios.put(`${import.meta.env.VITE_API_URL}/profile`, profile, {
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
      <div className="min-h-[calc(100vh-64px)] flex items-center justify-center p-6 bg-transparent transition-colors duration-300">
        <div className="glass-card text-center max-w-[400px] w-full">
          <AlertCircle className="w-10 h-10 text-error mx-auto mb-5" />
          <h2 className="text-2xl font-bold text-on-surface dark:text-on-dark mb-2">Sign in required</h2>
        </div>
      </div>
    );
  }

  if (loading) {
    return <div className="min-h-[calc(100vh-64px)] flex items-center justify-center text-on-surface dark:text-on-dark font-medium">Loading Profile...</div>;
  }

  const inputClass = "premium-input";

  return (
    <div className="min-h-[calc(100vh-64px)] px-4 py-12 md:py-16 transition-colors duration-300 relative z-10">
      <div className="max-w-[800px] mx-auto w-full">
        <motion.div
           initial={{ opacity: 0, y: 16 }}
           animate={{ opacity: 1, y: 0 }}
           className="mb-8 flex items-center justify-between"
        >
          <div>
            <h1 className="text-4xl md:text-[40px] font-bold text-on-surface dark:text-on-dark tracking-tighter mb-2">My Profile</h1>
            <p className="text-[17px] text-gray-500 dark:text-dark-muted">Manage your professional identity. Extracted from your resume AI analysis.</p>
          </div>
          <button 
            onClick={handleSave} 
            disabled={saving}
            className="btn-premium flex items-center gap-2 px-6 py-2.5 text-sm"
          >
            {saving ? <span className="premium-spinner border-white/20 border-t-white" /> : <Save size={18} />}
            {saving ? 'Saving...' : 'Save Profile'}
          </button>
        </motion.div>

        {error && <div className="p-4 mb-6 text-error bg-error/10 rounded-xl">{error}</div>}
        {success && <div className="p-4 mb-6 text-success bg-success/10 rounded-xl">Profile saved successfully!</div>}

        {/* Basics Section */}
        <div className="glass-card mb-6">
          <h3 className="text-xl font-bold text-on-surface dark:text-on-dark mb-4">Basic Information</h3>
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
        <div className="glass-card mb-6">
          <h3 className="text-xl font-bold text-on-surface dark:text-on-dark mb-4">Skills</h3>
          <p className="text-sm text-gray-500 mb-2">Comma separated skills</p>
          <input placeholder="React, Node.js, Python..." value={(profile.skills || []).join(', ')} onChange={handleSkillsChange} className={inputClass} />
        </div>

        {/* Experience Section */}
        <div className="glass-card mb-6">
          <div className="flex justify-between items-center mb-4 text-on-surface dark:text-on-dark">
            <h3 className="text-xl font-bold">Experience</h3>
            <button onClick={() => addArrayItem('experience')} className="text-primary-500 hover:text-primary-400 flex items-center gap-1 text-sm font-medium">
              <Plus size={16} /> Add Experience
            </button>
          </div>
          {(profile.experience || []).map((exp, idx) => (
            <div key={idx} className="glass-panel mb-4 relative">
              <button onClick={() => removeArrayItem('experience', idx)} className="absolute top-4 right-4 text-gray-400 hover:text-error transition"><Trash2 size={16} /></button>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3 pr-8">
                <input placeholder="Company" value={exp.company} onChange={e => updateArrayItem('experience', idx, 'company', e.target.value)} className={inputClass} />
                <input placeholder="Role" value={exp.role} onChange={e => updateArrayItem('experience', idx, 'role', e.target.value)} className={inputClass} />
                <input placeholder="Duration (e.g. 2020 - 2022)" value={exp.duration} onChange={e => updateArrayItem('experience', idx, 'duration', e.target.value)} className={inputClass} />
              </div>
              <textarea placeholder="Description" value={exp.description} onChange={e => updateArrayItem('experience', idx, 'description', e.target.value)} className={`${inputClass} min-h-[80px]`} />
            </div>
          ))}
          {(!profile.experience || profile.experience.length === 0) && <p className="text-gray-500 text-sm">No experience added.</p>}
        </div>

        {/* Projects Section */}
        <div className="glass-card mb-6">
          <div className="flex justify-between items-center mb-4 text-on-surface dark:text-on-dark">
            <h3 className="text-xl font-bold">Projects</h3>
            <button onClick={() => addArrayItem('projects')} className="text-primary-500 hover:text-primary-400 flex items-center gap-1 text-sm font-medium">
              <Plus size={16} /> Add Project
            </button>
          </div>
          {(profile.projects || []).map((proj, idx) => (
            <div key={idx} className="glass-panel mb-4 relative">
              <button onClick={() => removeArrayItem('projects', idx)} className="absolute top-4 right-4 text-gray-400 hover:text-error transition"><Trash2 size={16} /></button>
              <div className="grid grid-cols-1 gap-3 mb-3 pr-8">
                <input placeholder="Project Name" value={proj.name} onChange={e => updateArrayItem('projects', idx, 'name', e.target.value)} className={inputClass} />
                <input placeholder="Tech Stack (comma separated)" value={(proj.techStack || []).join(', ')} onChange={e => updateArrayItem('projects', idx, 'techStack', e.target.value)} className={inputClass} />
              </div>
              <textarea placeholder="Description" value={proj.description} onChange={e => updateArrayItem('projects', idx, 'description', e.target.value)} className={`${inputClass} min-h-[80px]`} />
            </div>
          ))}
          {(!profile.projects || profile.projects.length === 0) && <p className="text-gray-500 text-sm">No projects added.</p>}
        </div>

        {/* Education Section */}
        <div className="glass-card mb-6">
          <div className="flex justify-between items-center mb-4 text-on-surface dark:text-on-dark">
            <h3 className="text-xl font-bold">Education</h3>
            <button onClick={() => addArrayItem('education')} className="text-primary-500 hover:text-primary-400 flex items-center gap-1 text-sm font-medium">
              <Plus size={16} /> Add Education
            </button>
          </div>
          {(profile.education || []).map((edu, idx) => (
            <div key={idx} className="glass-panel mb-4 relative">
               <button onClick={() => removeArrayItem('education', idx)} className="absolute top-4 right-4 text-gray-400 hover:text-error transition"><Trash2 size={16} /></button>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pr-8">
                <input placeholder="Institution" value={edu.institution} onChange={e => updateArrayItem('education', idx, 'institution', e.target.value)} className={inputClass} />
                <input placeholder="Degree" value={edu.degree} onChange={e => updateArrayItem('education', idx, 'degree', e.target.value)} className={inputClass} />
                <input placeholder="Duration/Year" value={edu.duration} onChange={e => updateArrayItem('education', idx, 'duration', e.target.value)} className={inputClass} />
              </div>
            </div>
          ))}
          {(!profile.education || profile.education.length === 0) && <p className="text-gray-500 text-sm">No education added.</p>}
        </div>

        <div className="flex justify-end mb-12">
            <button 
              onClick={handleSave} 
              disabled={saving}
              className="btn-premium flex items-center gap-2 px-8 py-3.5 text-[15px]"
            >
              {saving ? <span className="premium-spinner border-white/20 border-t-white" /> : <Save size={18} />}
              {saving ? 'Saving...' : 'Save Profile'}
            </button>
        </div>

      </div>
    </div>
  );
};

export default Profile;
